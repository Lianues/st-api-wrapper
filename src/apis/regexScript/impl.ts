import type { 
  GetInput, GetOutput,
  ListInput, ListOutput,
  ProcessInput, ProcessOutput, 
  RunInput, 
  CreateInput, CreateOutput, 
  UpdateInput, UpdateOutput, 
  DeleteInput, DeleteOutput,
  RegexScriptData,
  RegexScope,
} from './types';
import { fromStRegex, getScopeType, toStRegex } from './utils';

/**
 * 动态导入酒馆正则引擎
 */
async function importRegexEngine(): Promise<any> {
  try {
    return await eval('import("/scripts/extensions/regex/engine.js")');
  } catch (e) {
    console.warn('[ST API] Regex engine import failed', e);
    return null;
  }
}

/**
 * 列出正则脚本（按作用域筛选）
 */
export async function list(input?: ListInput): Promise<ListOutput> {
  const includeGlobal = input?.includeGlobal ?? true;
  const includeCharacter = input?.includeCharacter ?? true;
  const includePreset = input?.includePreset ?? true;
  const options = { allowedOnly: !!input?.allowedOnly };

  const engine = await importRegexEngine();
  if (!engine) {
    const ctx = window.SillyTavern.getContext();
    const raw = includeGlobal ? (ctx.extensionSettings.regex || []) : [];
    return { regexScripts: (raw as any[]).map(fromStRegex) };
  }

  const { getScriptsByType, SCRIPT_TYPES } = engine;
  let rawScripts: any[] = [];

  if (includeGlobal) {
    rawScripts = rawScripts.concat(getScriptsByType(SCRIPT_TYPES.GLOBAL, options));
  }
  if (includeCharacter) {
    rawScripts = rawScripts.concat(getScriptsByType(SCRIPT_TYPES.SCOPED, options));
  }
  if (includePreset) {
    rawScripts = rawScripts.concat(getScriptsByType(SCRIPT_TYPES.PRESET, options));
  }

  return { regexScripts: rawScripts.map(fromStRegex) };
}

/**
 * 获取单个正则脚本（按 id 或 name）
 */
export async function get(input: GetInput): Promise<GetOutput> {
  const idOrName = String(input.idOrName || '').trim();
  if (!idOrName) throw new Error('idOrName is required');

  const options = { allowedOnly: !!input.allowedOnly };
  const match = (raw: any) => raw && (raw.id === idOrName || raw.scriptName === idOrName);

  const engine = await importRegexEngine();
  if (!engine) {
    const ctx = window.SillyTavern.getContext();
    const rawList: any[] = Array.isArray(ctx.extensionSettings.regex) ? ctx.extensionSettings.regex : [];
    const raw = rawList.find(match);
    return raw ? { regexScript: fromStRegex(raw), scope: 'global' } : { regexScript: null, scope: null };
  }

  const { getScriptsByType, SCRIPT_TYPES } = engine;
  const scopes: RegexScope[] = input.scope ? [input.scope] : ['global', 'character', 'preset'];

  for (const scope of scopes) {
    const type = getScopeType(scope, SCRIPT_TYPES);
    const rawList: any[] = getScriptsByType(type, options) || [];
    const raw = rawList.find(match);
    if (raw) return { regexScript: fromStRegex(raw), scope };
  }

  return { regexScript: null, scope: null };
}

/**
 * 使用正则处理文本 (Placement)
 */
export async function process(input: ProcessInput): Promise<ProcessOutput> {
  const engine = await importRegexEngine();
  if (!engine) return { text: input.text };
  
  const result = engine.getRegexedString(input.text, input.placement);
  return { text: result };
}

/**
 * 运行特定正则脚本
 */
export async function run(input: RunInput): Promise<ProcessOutput> {
  const { regexScript } = await get({ idOrName: input.idOrName });
  if (!regexScript) throw new Error(`Regex script not found: ${input.idOrName}`);

  const engine = await importRegexEngine();
  if (!engine) return { text: input.text };

  const stScript = toStRegex(regexScript);
  const result = engine.runRegexScript(stScript, input.text);
  return { text: result };
}

/**
 * 创建正则脚本
 */
export async function create(input: CreateInput): Promise<CreateOutput> {
  const engine = await importRegexEngine();
  if (!engine) throw new Error('Regex engine not available');

  const { SCRIPT_TYPES, saveScriptsByType, getScriptsByType } = engine;
  const scope = input.scope || 'global';
  const scriptType = getScopeType(scope, SCRIPT_TYPES);
  
  const scripts = [...getScriptsByType(scriptType)];
  
  const id = (window as any).uuidv4?.() || crypto.randomUUID();
  const newScriptData: RegexScriptData = {
    id,
    name: input.regexScript.name || 'New Script',
    enabled: input.regexScript.enabled ?? true,
    findRegex: input.regexScript.findRegex || '',
    replaceRegex: input.regexScript.replaceRegex || '',
    trimRegex: input.regexScript.trimRegex || [],
    targets: input.regexScript.targets || ['userInput'],
    view: input.regexScript.view || [],
    runOnEdit: input.regexScript.runOnEdit ?? true,
    macroMode: input.regexScript.macroMode || 'none',
    minDepth: input.regexScript.minDepth ?? null,
    maxDepth: input.regexScript.maxDepth ?? null,
  };

  const stScript = toStRegex(newScriptData);
  scripts.push(stScript);
  await saveScriptsByType(scripts, scriptType);
  
  // 触发酒馆界面更新和设置保存
  const ctx = window.SillyTavern.getContext();
  ctx.saveSettingsDebounced?.();
  ctx.eventSource?.emit(ctx.eventTypes.PRESET_CHANGED);
  ctx.reloadCurrentChat?.();

  return { success: true, regexScript: newScriptData };
}

/**
 * 更新正则脚本
 */
export async function update(input: UpdateInput): Promise<UpdateOutput> {
  const engine = await importRegexEngine();
  if (!engine) throw new Error('Regex engine not available');

  const { SCRIPT_TYPES, saveScriptsByType, getScriptsByType } = engine;
  
  let targetScope: RegexScope | undefined = input.scope;
  let targetType: any;
  let targetScripts: any[] = [];
  let index = -1;

  const scopes: RegexScope[] = ['global', 'character', 'preset'];

  if (targetScope) {
    targetType = getScopeType(targetScope, SCRIPT_TYPES);
    targetScripts = getScriptsByType(targetType);
    index = targetScripts.findIndex(s => s.id === input.id);
  } else {
    // 按顺序查找: 全局 -> 角色 -> 预设
    for (const s of scopes) {
      const type = getScopeType(s, SCRIPT_TYPES);
      const scripts = getScriptsByType(type);
      const idx = scripts.findIndex((item: any) => item.id === input.id);
      if (idx !== -1) {
        targetScope = s;
        targetType = type;
        targetScripts = scripts;
        index = idx;
        break;
      }
    }
  }

  if (index === -1) throw new Error(`Regex script with ID ${input.id} not found in any scope`);

  const currentData = fromStRegex(targetScripts[index]);
  const updatedData: RegexScriptData = {
    ...currentData,
    ...input.regexScript,
    id: input.id // 强制保持 ID 不变
  };

  const newScripts = [...targetScripts];
  newScripts[index] = toStRegex(updatedData);
  
  await saveScriptsByType(newScripts, targetType);
  const ctx = window.SillyTavern.getContext();
  ctx.saveSettingsDebounced?.();
  ctx.eventSource?.emit(ctx.eventTypes.PRESET_CHANGED);
  ctx.reloadCurrentChat?.();

  return { success: true, regexScript: updatedData };
}

/**
 * 删除正则脚本
 */
export async function deleteScript(input: DeleteInput): Promise<DeleteOutput> {
  const engine = await importRegexEngine();
  if (!engine) throw new Error('Regex engine not available');

  const { SCRIPT_TYPES, saveScriptsByType, getScriptsByType } = engine;
  
  let targetScope: RegexScope | undefined = input.scope;
  let targetType: any;
  let targetScripts: any[] = [];
  let index = -1;

  const scopes: RegexScope[] = ['global', 'character', 'preset'];

  if (targetScope) {
    targetType = getScopeType(targetScope, SCRIPT_TYPES);
    targetScripts = getScriptsByType(targetType);
    index = targetScripts.findIndex(s => s.id === input.id);
  } else {
    for (const s of scopes) {
      const type = getScopeType(s, SCRIPT_TYPES);
      const scripts = getScriptsByType(type);
      const idx = scripts.findIndex((item: any) => item.id === input.id);
      if (idx !== -1) {
        targetScope = s;
        targetType = type;
        targetScripts = scripts;
        index = idx;
        break;
      }
    }
  }

  if (index === -1) throw new Error(`Regex script with ID ${input.id} not found in any scope`);

  const newScripts = targetScripts.filter(s => s.id !== input.id);
  await saveScriptsByType(newScripts, targetType);
  const ctx = window.SillyTavern.getContext();
  ctx.saveSettingsDebounced?.();
  ctx.eventSource?.emit(ctx.eventTypes.PRESET_CHANGED);
  ctx.reloadCurrentChat?.();

  return { success: true };
}
