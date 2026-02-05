import type {
  FunctionToolInfo,
  GetFunctionToolInput,
  GetFunctionToolOutput,
  InvokeFunctionToolInput,
  InvokeFunctionToolOutput,
  IsSupportedOutput,
  ListFunctionToolsInput,
  ListFunctionToolsOutput,
  RegisterFunctionToolInput,
  RegisterFunctionToolOutput,
  UnregisterFunctionToolInput,
  UnregisterFunctionToolOutput,
} from './types';

type RegisteredMeta = {
  registeredAt: number;
};

// 记录通过本 wrapper 注册的工具（用于安全注销/过滤列表）
const registeredByName = new Map<string, RegisteredMeta>();

function getContext(): any {
  return (window as any).SillyTavern?.getContext?.();
}

function normalizeName(name: unknown): string {
  return String(name ?? '').trim();
}

function listAllToolsFromContext(ctx: any): any[] {
  const ToolManager = ctx?.ToolManager;
  const tools = ToolManager?.tools;
  return Array.isArray(tools) ? tools : [];
}

function serializeTool(tool: any): Omit<FunctionToolInfo, 'registeredByWrapper' | 'registeredAt'> | null {
  try {
    const openAi = typeof tool?.toFunctionOpenAI === 'function' ? tool.toFunctionOpenAI() : null;
    const fn = openAi?.function;

    const name = typeof fn?.name === 'string' ? fn.name : '';
    if (!name) return null;

    const displayName = typeof tool?.displayName === 'string' ? tool.displayName : undefined;
    const description = typeof fn?.description === 'string' ? fn.description : '';
    const parameters = (fn?.parameters ?? {}) as Record<string, any>;
    const stealth = !!tool?.stealth;

    return {
      name,
      displayName,
      description,
      parameters,
      stealth,
    };
  } catch {
    return null;
  }
}

function findToolByName(ctx: any, name: string): FunctionToolInfo | null {
  const tools = listAllToolsFromContext(ctx);
  for (const t of tools) {
    const core = serializeTool(t);
    if (!core) continue;
    if (core.name !== name) continue;

    const meta = registeredByName.get(name);
    return {
      ...core,
      registeredByWrapper: !!meta,
      registeredAt: meta?.registeredAt,
    };
  }
  return null;
}

export async function isSupported(): Promise<IsSupportedOutput> {
  const ctx = getContext();
  const supported = !!ctx?.isToolCallingSupported?.();
  return { supported };
}

export async function register(input: RegisterFunctionToolInput): Promise<RegisterFunctionToolOutput> {
  const ctx = getContext();
  const name = normalizeName(input?.name);

  try {
    if (!ctx) {
      return { ok: false, name, error: 'SillyTavern context not available' };
    }

    if (typeof ctx.registerFunctionTool !== 'function') {
      return { ok: false, name, error: 'registerFunctionTool not available in SillyTavern context' };
    }

    if (!name) {
      return { ok: false, name: '', error: 'name is required' };
    }

    if (!input?.description) {
      return { ok: false, name, error: 'description is required' };
    }

    if (!input?.parameters || typeof input.parameters !== 'object') {
      return { ok: false, name, error: 'parameters (JSON schema object) is required' };
    }

    if (typeof input.action !== 'function') {
      return { ok: false, name, error: 'action must be a function' };
    }

    const allowOverwrite = !!input.allowOverwrite;
    const existedBefore = !!findToolByName(ctx, name);

    if (existedBefore && !allowOverwrite) {
      return {
        ok: false,
        name,
        overwritten: false,
        error: `Tool already exists: ${name}. Pass allowOverwrite=true to overwrite it.`,
      };
    }

    ctx.registerFunctionTool({
      name,
      displayName: input.displayName,
      description: input.description,
      parameters: input.parameters,
      action: input.action,
      formatMessage: input.formatMessage,
      shouldRegister: input.shouldRegister,
      stealth: input.stealth,
    });

    const registeredAt = Date.now();
    registeredByName.set(name, { registeredAt });

    return {
      ok: true,
      name,
      overwritten: existedBefore,
      registeredAt,
    };
  } catch (e) {
    return {
      ok: false,
      name,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function unregister(input: UnregisterFunctionToolInput): Promise<UnregisterFunctionToolOutput> {
  const ctx = getContext();
  const name = normalizeName(input?.name);

  try {
    if (!ctx) {
      return { ok: false, name, error: 'SillyTavern context not available' };
    }

    if (typeof ctx.unregisterFunctionTool !== 'function') {
      return { ok: false, name, error: 'unregisterFunctionTool not available in SillyTavern context' };
    }

    if (!name) {
      return { ok: false, name: '', error: 'name is required' };
    }

    const force = !!input.force;

    if (!force && !registeredByName.has(name)) {
      return {
        ok: false,
        name,
        error: `Tool "${name}" is not registered by this wrapper. Pass force=true to unregister anyway.`,
      };
    }

    const existedBefore = !!findToolByName(ctx, name);

    ctx.unregisterFunctionTool(name);
    registeredByName.delete(name);

    return { ok: true, name, existed: existedBefore };
  } catch (e) {
    return {
      ok: false,
      name,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function list(input?: ListFunctionToolsInput): Promise<ListFunctionToolsOutput> {
  const ctx = getContext();
  if (!ctx) return { tools: [] };

  const onlyRegisteredByWrapper = !!input?.onlyRegisteredByWrapper;

  const tools = listAllToolsFromContext(ctx)
    .map((t) => {
      const core = serializeTool(t);
      if (!core) return null;
      const meta = registeredByName.get(core.name);
      const info: FunctionToolInfo = {
        ...core,
        registeredByWrapper: !!meta,
        registeredAt: meta?.registeredAt,
      };
      return info;
    })
    .filter((x): x is FunctionToolInfo => !!x);

  return {
    tools: onlyRegisteredByWrapper ? tools.filter((t) => t.registeredByWrapper) : tools,
  };
}

export async function get(input: GetFunctionToolInput): Promise<GetFunctionToolOutput> {
  const ctx = getContext();
  const name = normalizeName(input?.name);

  if (!ctx) return { ok: false, error: 'SillyTavern context not available' };
  if (!name) return { ok: false, error: 'name is required' };

  const tool = findToolByName(ctx, name);
  if (!tool) {
    return { ok: false, error: `Tool not found: ${name}` };
  }

  return { ok: true, tool };
}

export async function invoke(input: InvokeFunctionToolInput): Promise<InvokeFunctionToolOutput> {
  const ctx = getContext();
  const name = normalizeName(input?.name);

  try {
    if (!ctx) return { ok: false, name, error: 'SillyTavern context not available' };

    const ToolManager = ctx.ToolManager;
    if (!ToolManager || typeof ToolManager.invokeFunctionTool !== 'function') {
      return { ok: false, name, error: 'ToolManager.invokeFunctionTool not available in SillyTavern context' };
    }

    if (!name) return { ok: false, name: '', error: 'name is required' };

    const existed = !!findToolByName(ctx, name);
    if (!existed) return { ok: false, name, error: `Tool not found: ${name}` };

    const result = await ToolManager.invokeFunctionTool(name, input?.parameters ?? {});
    return { ok: true, name, result };
  } catch (e) {
    return { ok: false, name, error: e instanceof Error ? e.message : String(e) };
  }
}
