import type {
  ServerPluginAddInput,
  ServerPluginAddOutput,
  ServerPluginAddPathInput,
  ServerPluginAddPathOutput,
  ServerPluginAddZipInput,
  ServerPluginAddZipOutput,
  ServerPluginDeleteInput,
  ServerPluginDeleteOutput,
  ServerPluginGetInput,
  ServerPluginGetOutput,
  ServerPluginListInput,
  ServerPluginListOutput,
  ServerPluginRestartInput,
  ServerPluginRestartOutput,
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

export async function list(input?: ServerPluginListInput): Promise<ServerPluginListOutput> {
  return await postJson<ServerPluginListOutput>('/api/plugins/server-plugin-manager/list', input ?? {});
}

export async function get(input: ServerPluginGetInput): Promise<ServerPluginGetOutput> {
  if (!input?.name) throw new Error('serverPlugin.get: name is required');
  return await postJson<ServerPluginGetOutput>('/api/plugins/server-plugin-manager/get', input);
}

export async function add(input: ServerPluginAddInput): Promise<ServerPluginAddOutput> {
  if (!input?.gitUrl) throw new Error('serverPlugin.add: gitUrl is required');
  return await postJson<ServerPluginAddOutput>('/api/plugins/server-plugin-manager/add', input);
}

export async function addZip(input: ServerPluginAddZipInput): Promise<ServerPluginAddZipOutput> {
  if (!input?.zipBase64) throw new Error('serverPlugin.addZip: zipBase64 is required');
  return await postJson<ServerPluginAddZipOutput>('/api/plugins/server-plugin-manager/addZip', input);
}

export async function addPath(input: ServerPluginAddPathInput): Promise<ServerPluginAddPathOutput> {
  if (!input?.sourcePath) throw new Error('serverPlugin.addPath: sourcePath is required');
  return await postJson<ServerPluginAddPathOutput>('/api/plugins/server-plugin-manager/addPath', input);
}

export async function deletePlugin(input: ServerPluginDeleteInput): Promise<ServerPluginDeleteOutput> {
  if (!input?.name) throw new Error('serverPlugin.delete: name is required');
  return await postJson<ServerPluginDeleteOutput>('/api/plugins/server-plugin-manager/delete', input);
}

export async function restart(input?: ServerPluginRestartInput): Promise<ServerPluginRestartOutput> {
  return await postJson<ServerPluginRestartOutput>('/api/plugins/server-plugin-manager/restart', input ?? {});
}

