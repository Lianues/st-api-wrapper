import type {
  GetVariableInput,
  GetVariableOutput,
  ListVariableInput,
  ListVariableOutput,
  SetVariableInput,
  SetVariableOutput,
  DeleteVariableInput,
  DeleteVariableOutput,
  ModifyVariableInput,
  ModifyVariableOutput,
} from './types';

function getContext() {
  return (window as any).SillyTavern?.getContext?.();
}

/**
 * 触发 UI 和设置刷新
 */
function triggerRefresh() {
  const ctx = getContext();
  if (!ctx) return;

  // 1. 触发设置保存
  if (ctx.saveSettingsDebounced) {
    ctx.saveSettingsDebounced();
  }

  // 2. 触发全局事件，确保相关面板（如变量列表、正则等）同步
  if (ctx.eventSource && ctx.eventTypes) {
    const { eventSource, eventTypes } = ctx;
    eventSource.emit(eventTypes.PRESET_CHANGED);
    eventSource.emit(eventTypes.SETTINGS_LOADED);
    // 针对变量变更，有时会有专门的事件，这里通用处理
  }
}

/**
 * 获取变量
 */
export async function get(input?: GetVariableInput): Promise<GetVariableOutput> {
  const ctx = getContext();
  if (!ctx) throw new Error('SillyTavern context not available');
  
  const scope = input?.scope || 'local';
  const name = input?.name;

  if (!name) throw new Error('Variable name is required');

  const value = ctx.variables[scope].get(name);
  return { value };
}

/**
 * 列出变量（返回指定作用域下的所有变量映射）
 */
export async function list(input?: ListVariableInput): Promise<ListVariableOutput> {
  const ctx = getContext();
  if (!ctx) throw new Error('SillyTavern context not available');

  const scope = input?.scope || 'local';

  if (scope === 'local') {
    return { variables: { ...(ctx.chatMetadata?.variables || {}) } };
  }

  const globals = (window as any).variables || {};
  return { variables: { ...globals } };
}

/**
 * 设置变量
 */
export async function set(input: SetVariableInput): Promise<SetVariableOutput> {
  const ctx = getContext();
  if (!ctx) return { ok: false };

  const scope = input.scope || 'local';
  ctx.variables[scope].set(input.name, input.value);
  
  triggerRefresh();
  return { ok: true };
}

/**
 * 删除变量
 */
export async function deleteVariable(input: DeleteVariableInput): Promise<DeleteVariableOutput> {
  const ctx = getContext();
  if (!ctx) return { ok: false };

  const scope = input.scope || 'local';
  ctx.variables[scope].del(input.name);

  triggerRefresh();
  return { ok: true };
}

/**
 * 增加变量值 (Add)
 */
export async function add(input: ModifyVariableInput): Promise<ModifyVariableOutput> {
  const ctx = getContext();
  if (!ctx) return { ok: false };

  const scope = input.scope || 'local';
  ctx.variables[scope].add(input.name, input.value);

  triggerRefresh();
  return { ok: true };
}

/**
 * 变量自增 (Increment)
 */
export async function inc(input: ModifyVariableInput): Promise<ModifyVariableOutput> {
  const ctx = getContext();
  if (!ctx) return { ok: false };

  const scope = input.scope || 'local';
  ctx.variables[scope].inc(input.name);

  triggerRefresh();
  return { ok: true };
}

/**
 * 变量自减 (Decrement)
 */
export async function dec(input: ModifyVariableInput): Promise<ModifyVariableOutput> {
  const ctx = getContext();
  if (!ctx) return { ok: false };

  const scope = input.scope || 'local';
  ctx.variables[scope].dec(input.name);

  triggerRefresh();
  return { ok: true };
}
