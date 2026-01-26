import type {
  CommandEnvInput,
  CommandEnvOutput,
  CommandProbeInput,
  CommandProbeOutput,
  CommandRunInput,
  CommandRunOutput,
  CommandSandboxGetOutput,
  CommandSandboxSetInput,
  CommandWhichInput,
  CommandWhichOutput,
} from './types';

function getContext() {
  return (window as any).SillyTavern?.getContext?.();
}

async function postJson<TOutput>(url: string, input: any): Promise<TOutput> {
  const ctx = getContext();
  const headers: Record<string, string> = {};
  if (ctx?.getRequestHeaders) Object.assign(headers, ctx.getRequestHeaders());
  headers['Content-Type'] = 'application/json';

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(input ?? {}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed (${response.status} ${response.statusText}): ${text || url}`);
  }

  return await response.json();
}

/**
 * 探测后端 command-exec server plugin 是否可用，并返回平台/默认终端选择等信息。
 */
export async function probe(input?: CommandProbeInput): Promise<CommandProbeOutput> {
  return await postJson<CommandProbeOutput>('/api/plugins/command-exec/probe', input ?? {});
}

/**
 * 获取后端环境变量（默认返回常用子集）。
 */
export async function env(input?: CommandEnvInput): Promise<CommandEnvOutput> {
  return await postJson<CommandEnvOutput>('/api/plugins/command-exec/env', input ?? {});
}

/**
 * 查找系统中的某个命令位置。
 * - Windows: where
 * - POSIX: which -a
 */
export async function which(input?: CommandWhichInput): Promise<CommandWhichOutput> {
  return await postJson<CommandWhichOutput>('/api/plugins/command-exec/which', input ?? {});
}

/**
 * 执行后端命令（direct 或 script 模式）。
 */
export async function run(input: CommandRunInput): Promise<CommandRunOutput> {
  const hasScript = typeof input?.script === 'string' && input.script.trim() !== '';
  const hasCommand = typeof input?.command === 'string' && input.command.trim() !== '';
  if (!hasScript && !hasCommand) throw new Error('command.run: either script or command is required');
  return await postJson<CommandRunOutput>('/api/plugins/command-exec/run', input);
}

/**
 * 获取 command-exec 的权限配置。
 */
export async function getSandbox(): Promise<CommandSandboxGetOutput> {
  return await postJson<CommandSandboxGetOutput>('/api/plugins/command-exec/sandbox/get', {});
}

/**
 * 更新 command-exec 的权限配置（部分字段 patch）。
 */
export async function setSandbox(input: CommandSandboxSetInput): Promise<CommandSandboxGetOutput> {
  return await postJson<CommandSandboxGetOutput>('/api/plugins/command-exec/sandbox/set', { config: input ?? {} });
}

