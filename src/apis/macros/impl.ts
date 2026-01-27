import type {
  ListMacrosInput,
  ListMacrosOutput,
  MacroDefinitionSerializable,
  RegisterMacroInput,
  RegisterMacroOutput,
  UnregisterMacroInput,
  UnregisterMacroOutput,
  ProcessMacrosInput,
  ProcessMacrosOutput,
  RegisterMacroOptions,
  MacroAliasDef,
} from './types';

type RegisteredMeta = {
  primary: string;
  names: string[];
  registeredAt: number;
  engines: {
    macroEngine: boolean;
    legacy: boolean;
  };
};

// 记录通过本 wrapper 注册的宏（用于安全注销/过滤列表）
const registeredByPrimary = new Map<string, RegisteredMeta>();
const nameToPrimary = new Map<string, string>();

type LegacyMacroApi = {
  register?: (key: string, value: any, description?: string) => void;
  unregister?: (key: string) => void;
  has?: (key: string) => boolean;
};

// 旧宏系统会给函数宏传入 nonce（每次 substituteParams 调用一个），可用于做“同一次替换内稳定”的缓存
const legacyEnvByNonce = new Map<string, { env: any; ts: number }>();

function getContext(): any {
  return (window as any).SillyTavern?.getContext?.();
}

function normalizeName(name: unknown): string {
  return String(name ?? '').trim();
}

function normalizeAliasNames(aliases: MacroAliasDef[] | undefined | null): string[] {
  if (!Array.isArray(aliases)) return [];
  const list = aliases
    .map((a) => (a ? String((a as any).alias ?? '').trim() : ''))
    .filter(Boolean);
  return Array.from(new Set(list));
}

function isPromiseLike(x: any): boolean {
  return !!x && (typeof x === 'object' || typeof x === 'function') && typeof x.then === 'function';
}

async function importLegacyMacrosModule(): Promise<any | null> {
  try {
    // 使用 eval 避免打包器干预
    return await eval('import("/scripts/macros.js")');
  } catch (e) {
    console.warn('[ST API] Legacy macros module import failed', e);
    return null;
  }
}

async function getLegacyMacroApi(ctx: any): Promise<LegacyMacroApi> {
  const api: LegacyMacroApi = {};

  // 优先使用 getContext 暴露的兼容 API（更稳定）
  if (typeof ctx?.registerMacro === 'function') api.register = ctx.registerMacro.bind(ctx);
  if (typeof ctx?.unregisterMacro === 'function') api.unregister = ctx.unregisterMacro.bind(ctx);

  // has 需要从模块拿（ctx 默认不暴露）
  const mod = await importLegacyMacrosModule();
  const MacrosParser = mod?.MacrosParser;
  if (MacrosParser && typeof MacrosParser.has === 'function') {
    api.has = (key: string) => {
      try {
        return !!MacrosParser.has(key);
      } catch {
        return false;
      }
    };
    // 若 ctx 没有 register/unregister，则回退到模块方法
    if (!api.register && typeof MacrosParser.registerMacro === 'function') {
      api.register = (key: string, value: any, description?: string) => MacrosParser.registerMacro(key, value, description);
    }
    if (!api.unregister && typeof MacrosParser.unregisterMacro === 'function') {
      api.unregister = (key: string) => MacrosParser.unregisterMacro(key);
    }
  }

  return api;
}

function normalizeMacroResult(ctx: any, value: any): string {
  const normalizer = ctx?.macros?.engine?.normalizeMacroResult;
  if (typeof normalizer === 'function') {
    try {
      return normalizer.call(ctx.macros.engine, value);
    } catch {
      // fallthrough
    }
  }

  // fallback：与 MacroEngine.normalizeMacroResult 行为保持一致
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' || Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function isLegacyCompatible(options: RegisterMacroOptions): boolean {
  const unnamed = (options as any)?.unnamedArgs;
  const list = (options as any)?.list;

  // 旧版 registerMacro 仅支持 {{name}}（无参数）
  const unnamedOk =
    unnamed === undefined ||
    unnamed === null ||
    unnamed === 0 ||
    (Array.isArray(unnamed) && unnamed.length === 0);

  const listOk = !list;
  return unnamedOk && listOk;
}

function makeLegacyValueFactory(ctx: any, invokedName: string, userHandler: (execCtx: any) => any) {
  return (nonce: string) => {
    try {
      const key = typeof nonce === 'string' ? nonce : '';
      let cached = key ? legacyEnvByNonce.get(key) : undefined;
      const now = Date.now();

      if (!cached || now - cached.ts > 30_000) {
        const envBuilder = ctx?.macros?.envBuilder;
        const env = envBuilder?.buildFromRawEnv
          ? envBuilder.buildFromRawEnv({
              content: '',
              replaceCharacterCard: true,
              dynamicMacros: {},
              postProcessFn: (x: string) => x,
            })
          : {};

        if (env && typeof env === 'object') {
          env.extra = env.extra || {};
          env.extra.st_api_nonce = key;
        }

        cached = { env, ts: now };
        if (key) {
          legacyEnvByNonce.set(key, cached);
          // 简单防泄漏：最多保留 64 个 nonce
          if (legacyEnvByNonce.size > 64) {
            const firstKey = legacyEnvByNonce.keys().next().value;
            if (firstKey) legacyEnvByNonce.delete(firstKey);
          }
        }
      }

      const execCtx = {
        name: invokedName,
        args: [],
        unnamedArgs: [],
        list: null,
        namedArgs: null,
        raw: invokedName,
        env: cached.env,
        cstNode: null,
        range: null,
        normalize: (v: any) => normalizeMacroResult(ctx, v),
        nonce: key,
      };

      const result = userHandler(execCtx);
      // userHandler 已做 Promise 过滤；这里再兜底一次
      if (isPromiseLike(result)) return '';
      return normalizeMacroResult(ctx, result);
    } catch (e) {
      console.warn(`[ST API] Legacy macro "${invokedName}" failed; returning empty string.`, e);
      return '';
    }
  };
}

function sanitizeRegisterOptions(options: RegisterMacroOptions): any {
  // MacroRegistry 会自行做严格校验；这里仅做默认值补齐和最小整理
  const category = typeof options.category === 'string' && options.category.trim()
    ? options.category.trim()
    : 'custom';

  return {
    aliases: options.aliases,
    category,
    unnamedArgs: options.unnamedArgs,
    list: options.list,
    strictArgs: options.strictArgs,
    description: options.description ?? '',
    returns: options.returns,
    returnType: options.returnType,
    displayOverride: options.displayOverride,
    exampleUsage: options.exampleUsage,
    handler: options.handler,
  };
}

/**
 * 注册自定义宏（使用酒馆新版 MacroRegistry）
 */
export async function register(input: RegisterMacroInput): Promise<RegisterMacroOutput> {
  const name = normalizeName(input?.name);

  try {
    const ctx = getContext();
    if (!ctx) {
      return { ok: false, name, registeredNames: [], error: 'SillyTavern context not available' };
    }

    const registry = ctx.macros?.registry;
    if (!registry?.registerMacro) {
      return { ok: false, name, registeredNames: [], error: 'Macro registry not available in SillyTavern context' };
    }

    if (!name) {
      return { ok: false, name: '', registeredNames: [], error: 'name is required' };
    }

    if (!input?.options || typeof input.options !== 'object') {
      return { ok: false, name, registeredNames: [], error: 'options is required' };
    }

    if (typeof input.options.handler !== 'function') {
      return { ok: false, name, registeredNames: [], error: 'options.handler must be a function' };
    }

    const allowOverwrite = !!input.allowOverwrite;
    const existing = registeredByPrimary.get(name);
    let experimentalOn = !!ctx?.powerUserSettings?.experimental_macro_engine;
    const ensureExperimental = input.ensureExperimentalMacroEngine !== false; // default: true

    // 可选：自动开启 experimental macro engine（并尝试持久化）
    if (!experimentalOn && ensureExperimental) {
      try {
        if (ctx.powerUserSettings && typeof ctx.powerUserSettings === 'object') {
          ctx.powerUserSettings.experimental_macro_engine = true;
        } else if ((window as any).power_user && typeof (window as any).power_user === 'object') {
          (window as any).power_user.experimental_macro_engine = true;
        }
        ctx.saveSettingsDebounced?.();
        // 尝试通知 UI/其他逻辑刷新（有则调用，无则忽略）
        ctx.eventSource?.emit?.(ctx.eventTypes?.SETTINGS_LOADED);
        experimentalOn = true;
      } catch (e) {
        console.warn('[ST API] Failed to enable experimental_macro_engine automatically', e);
        // 不直接失败：继续注册到 MacroRegistry，但提示用户需要手动开启
      }
    }

    // registerLegacy：undefined 表示沿用上一次设置（如果存在），false 表示明确关闭
    const legacyDesired = input.registerLegacy === undefined ? !!existing?.engines.legacy : !!input.registerLegacy;
    const legacyEnabledNow = legacyDesired && !experimentalOn;

    const aliasNames = normalizeAliasNames(input.options.aliases);
    const allNames = Array.from(new Set([name, ...aliasNames]));

    if (!allowOverwrite && typeof registry.hasMacro === 'function') {
      const conflicts = allNames.filter((n) => {
        if (!registry.hasMacro(n)) return false;
        const owner = nameToPrimary.get(n);
        // 允许覆盖“自己之前注册的同名/别名”，但不允许覆盖其他来源的宏
        return owner !== name;
      });
      if (conflicts.length > 0) {
        return {
          ok: false,
          name,
          registeredNames: [],
          error: `Macro name already registered: ${conflicts.join(', ')}`,
        };
      }
    }

    // 若请求 legacy，但当前开启了 experimental_macro_engine，则跳过 legacy（否则会反向覆盖成 0 参数 legacy 宏）
    if (legacyDesired && experimentalOn) {
      console.warn(
        `[ST API] registerLegacy requested for macro "${name}", but experimental_macro_engine is enabled. Skipping legacy registration to avoid overriding the macro definition.`
      );
    }

    if (legacyEnabledNow && !isLegacyCompatible(input.options)) {
      return {
        ok: false,
        name,
        registeredNames: [],
        error: 'registerLegacy only supports 0-arg macros (use {{name}}). This macro declares unnamedArgs/list.',
      };
    }

    const legacyApi: LegacyMacroApi | null =
      !experimentalOn && (legacyEnabledNow || !!existing?.engines.legacy)
        ? await getLegacyMacroApi(ctx)
        : null;

    if (legacyEnabledNow) {
      if (!legacyApi?.register || !legacyApi?.unregister) {
        return {
          ok: false,
          name,
          registeredNames: [],
          error: 'Legacy macro API not available (cannot registerLegacy in this SillyTavern version).',
        };
      }

      if (!allowOverwrite && typeof legacyApi.has === 'function') {
        const conflictsLegacy = allNames.filter((n) => legacyApi.has?.(n) && nameToPrimary.get(n) !== name);
        if (conflictsLegacy.length > 0) {
          return {
            ok: false,
            name,
            registeredNames: [],
            error: `Legacy macro name already registered: ${conflictsLegacy.join(', ')}`,
          };
        }
      }
    }

    const sanitized = sanitizeRegisterOptions(input.options);

    // 强制同步：如果 handler 返回 Promise，会被吞掉并返回空字符串
    const userHandler = sanitized.handler;
    const wrappedHandler = (execCtx: any) => {
      try {
        const result = userHandler(execCtx);
        if (isPromiseLike(result)) {
          console.warn(
            `[ST API] Macro "${name}" handler returned a Promise. Async macros are not supported; returning empty string.`
          );
          return '';
        }
        return result;
      } catch (e) {
        console.warn(`[ST API] Macro "${name}" handler threw an error; returning empty string.`, e);
        return '';
      }
    };

    const def = registry.registerMacro(name, {
      ...sanitized,
      handler: wrappedHandler,
    });

    if (!def) {
      return { ok: false, name, registeredNames: [], error: 'Macro registration failed (see console for details)' };
    }

    const engines: Array<'macroEngine' | 'legacy'> = ['macroEngine'];

    // legacy：按 key 单独注册（支持别名）
    if (legacyEnabledNow && legacyApi?.register) {
      const desc = typeof sanitized.description === 'string' ? sanitized.description : '';
      for (const key of allNames) {
        legacyApi.register(key, makeLegacyValueFactory(ctx, key, wrappedHandler), desc);
      }
      engines.push('legacy');
    } else if (!experimentalOn && existing?.engines.legacy && legacyApi?.unregister && input.registerLegacy === false) {
      // 显式关闭 legacy：移除旧的 legacy 宏
      for (const key of existing.names) {
        try {
          legacyApi.unregister(key);
        } catch (e) {
          console.warn('[ST API] legacy unregister failed:', key, e);
        }
      }
    }

    // 清理“旧别名残留”（如果本次 aliases 变少）
    if (existing) {
      const stale = existing.names.filter((n) => !allNames.includes(n));
      for (const staleName of stale) {
        try {
          registry.unregisterMacro(staleName);
        } catch (e) {
          console.warn('[ST API] unregister stale macro alias failed:', staleName, e);
        }
        if (!experimentalOn && existing.engines.legacy && legacyApi?.unregister) {
          try {
            legacyApi.unregister(staleName);
          } catch (e) {
            console.warn('[ST API] unregister stale legacy macro failed:', staleName, e);
          }
        }
        if (nameToPrimary.get(staleName) === name) nameToPrimary.delete(staleName);
      }
    }

    const meta: RegisteredMeta = {
      primary: name,
      names: allNames,
      registeredAt: Date.now(),
      engines: {
        macroEngine: true,
        legacy: legacyEnabledNow,
      },
    };
    registeredByPrimary.set(name, meta);
    for (const n of allNames) nameToPrimary.set(n, name);

    return { ok: true, name, registeredNames: allNames, engines };
  } catch (e) {
    return {
      ok: false,
      name,
      registeredNames: [],
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * 注销自定义宏
 */
export async function unregister(input: UnregisterMacroInput): Promise<UnregisterMacroOutput> {
  try {
    const ctx = getContext();
    if (!ctx) return { ok: false, removed: [], error: 'SillyTavern context not available' };

    const registry = ctx.macros?.registry;
    if (!registry?.unregisterMacro) {
      return { ok: false, removed: [], error: 'Macro registry not available in SillyTavern context' };
    }

    const name = normalizeName(input?.name);
    if (!name) return { ok: false, removed: [], error: 'name is required' };

    const force = !!input.force;
    const primary = nameToPrimary.get(name) ?? name;
    const meta = registeredByPrimary.get(primary);
    const experimentalOn = !!ctx?.powerUserSettings?.experimental_macro_engine;
    const legacyApi = !experimentalOn && (meta?.engines.legacy || force) ? await getLegacyMacroApi(ctx) : null;

    let targets: string[] = [];
    if (meta) {
      targets = meta.names;
    } else if (force) {
      targets = [name];
    } else {
      return { ok: false, removed: [], error: `Macro not registered by ST_API: ${name}` };
    }

    const removedSet = new Set<string>();
    for (const n of targets) {
      try {
        const didRemove = registry.unregisterMacro(n);
        if (didRemove) removedSet.add(n);
      } catch (e) {
        console.warn('[ST API] unregister macro failed:', n, e);
      }
      // 尝试同步移除 legacy 宏（仅当 experimental off 时有效）
      if (!experimentalOn && legacyApi?.unregister) {
        try {
          legacyApi.unregister(n);
          removedSet.add(n);
        } catch (e) {
          console.warn('[ST API] legacy unregister macro failed:', n, e);
        }
      }
    }

    // 清理本地追踪
    if (meta) {
      registeredByPrimary.delete(primary);
      for (const n of meta.names) {
        if (nameToPrimary.get(n) === primary) nameToPrimary.delete(n);
      }
    } else {
      // force 单点删除：仅清理对应映射
      if (nameToPrimary.get(name) === primary) nameToPrimary.delete(name);
    }

    const removed = Array.from(removedSet);
    if (removed.length === 0) {
      return { ok: false, removed: [], error: `Macro not found: ${name}` };
    }

    return { ok: true, removed };
  } catch (e) {
    return { ok: false, removed: [], error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * 列出宏定义（来自新版 MacroRegistry；不返回 handler）
 */
export async function list(input?: ListMacrosInput): Promise<ListMacrosOutput> {
  const ctx = getContext();
  const registry = ctx?.macros?.registry;
  if (!registry?.getAllMacros) return { macros: [] };

  const excludeAliases = !!input?.excludeAliases;
  const excludeHiddenAliases = !!input?.excludeHiddenAliases;
  const onlyRegisteredByWrapper = !!input?.onlyRegisteredByWrapper;

  const defs: any[] = registry.getAllMacros({ excludeAliases, excludeHiddenAliases }) || [];

  const macros: MacroDefinitionSerializable[] = defs
    .map((d) => {
      const registeredByWrapper = nameToPrimary.has(String(d?.name ?? ''));
      const item: MacroDefinitionSerializable = {
        name: String(d?.name ?? ''),
        aliases: Array.isArray(d?.aliases)
          ? d.aliases.map((a: any) => ({
              alias: String(a?.alias ?? ''),
              visible: a?.visible !== false,
            }))
          : [],
        category: String(d?.category ?? ''),
        minArgs: Number(d?.minArgs ?? 0),
        maxArgs: Number(d?.maxArgs ?? 0),
        unnamedArgDefs: Array.isArray(d?.unnamedArgDefs) ? d.unnamedArgDefs : [],
        list: d?.list ? { min: Number(d.list.min ?? 0), max: d.list.max ?? null } : null,
        strictArgs: d?.strictArgs !== false,
        description: String(d?.description ?? ''),
        returns: d?.returns ?? null,
        returnType: d?.returnType ?? 'string',
        displayOverride: d?.displayOverride ?? null,
        exampleUsage: Array.isArray(d?.exampleUsage) ? d.exampleUsage : [],
        source: d?.source,
        aliasOf: d?.aliasOf ?? null,
        aliasVisible: d?.aliasVisible ?? null,
        registeredByWrapper,
      };
      return item;
    })
    .filter((d) => (onlyRegisteredByWrapper ? d.registeredByWrapper : true));

  return { macros };
}

/**
 * 处理文本中的宏，并返回处理后的文本
 */
export async function process(input: ProcessMacrosInput): Promise<ProcessMacrosOutput> {
  try {
    const ctx = getContext();
    if (!ctx) return { ok: false, text: String(input?.text ?? ''), engine: 'substituteParams', error: 'SillyTavern context not available' };

    const text = String(input?.text ?? '');
    const options = input?.options ?? {};
    const forceNewEngine = !!input?.forceNewEngine;

    const dynamicMacros = options.dynamicMacros ?? {};
    const postProcessFn = options.postProcessFn ?? ((x: string) => x);

    const hasFunctionDynamicMacro =
      dynamicMacros &&
      typeof dynamicMacros === 'object' &&
      Object.values(dynamicMacros).some((v) => typeof v === 'function');

    const canUseMacroEngine =
      !!ctx.macros?.envBuilder?.buildFromRawEnv &&
      !!ctx.macros?.engine?.evaluate;

    // 为避免 legacy 引擎把函数当作 (nonce)=>string 调用造成报错，
    // 当 dynamicMacros 中包含函数时，尽量走新版 MacroEngine。
    const shouldUseMacroEngine = (forceNewEngine || hasFunctionDynamicMacro) && canUseMacroEngine;

    if ((forceNewEngine || hasFunctionDynamicMacro) && !canUseMacroEngine) {
      return {
        ok: false,
        text,
        engine: 'substituteParams',
        error: 'MacroEngine not available in SillyTavern context (cannot process with forceNewEngine / function dynamicMacros).',
      };
    }

    if (shouldUseMacroEngine) {
      const rawEnv = {
        content: text,
        name1Override: options.name1Override,
        name2Override: options.name2Override,
        original: options.original,
        groupOverride: options.groupOverride,
        replaceCharacterCard: options.replaceCharacterCard ?? true,
        dynamicMacros,
        postProcessFn,
      };
      const env = ctx.macros.envBuilder.buildFromRawEnv(rawEnv);
      const result = ctx.macros.engine.evaluate(text, env);
      return { ok: true, text: String(result ?? ''), engine: 'macroEngine' };
    }

    if (!ctx.substituteParams) {
      return { ok: false, text, engine: 'substituteParams', error: 'substituteParams not available in SillyTavern context' };
    }

    const result = ctx.substituteParams(text, {
      ...options,
      dynamicMacros,
      postProcessFn,
    });
    return { ok: true, text: String(result ?? ''), engine: 'substituteParams' };
  } catch (e) {
    return {
      ok: false,
      text: String(input?.text ?? ''),
      engine: 'substituteParams',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

