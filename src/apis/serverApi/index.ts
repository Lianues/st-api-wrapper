import type { ApiRegistry, ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  ListServerApiOutput,
  RegisterServerApiInput,
  RegisterServerApiOutput,
  ServerApiHttpMethod,
  ServerApiResponseType,
  UnregisterServerApiInput,
  UnregisterServerApiOutput,
} from './types';

const RESERVED_ROOT_KEYS = new Set<string>([
  'version',
  'call',
  'listEndpoints',
  'getDocPath',
]);

function isValidIdentifier(s: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s);
}

function normalizeMethod(m?: string): ServerApiHttpMethod {
  const up = String(m || 'POST').toUpperCase();
  switch (up) {
    case 'GET':
    case 'POST':
    case 'PUT':
    case 'PATCH':
    case 'DELETE':
    case 'HEAD':
    case 'OPTIONS':
      return up;
    default:
      return 'POST';
  }
}

function normalizeResponseType(t?: string): ServerApiResponseType {
  const v = String(t || 'json').toLowerCase();
  return v === 'text' ? 'text' : 'json';
}

function makeFetchHandler(input: {
  url: string;
  method: ServerApiHttpMethod;
  useRequestHeaders: boolean;
  headers?: Record<string, string>;
  contentType: string;
  responseType: ServerApiResponseType;
}) {
  return async (body: any) => {
    const ctx = (window as any).SillyTavern?.getContext?.();
    const headers: Record<string, string> = {};

    if (input.useRequestHeaders && ctx?.getRequestHeaders) {
      Object.assign(headers, ctx.getRequestHeaders());
    }
    if (input.headers && typeof input.headers === 'object') {
      Object.assign(headers, input.headers);
    }

    const method = input.method;
    const init: RequestInit = { method, headers };

    if (method !== 'GET' && method !== 'HEAD') {
      headers['Content-Type'] = input.contentType || 'application/json';
      if ((headers['Content-Type'] || '').includes('application/json')) {
        init.body = JSON.stringify(body ?? {});
      } else if (typeof body === 'string') {
        init.body = body;
      } else {
        init.body = JSON.stringify(body ?? {});
      }
    }

    const res = await fetch(input.url, init);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Request failed (${res.status} ${res.statusText}): ${text || input.url}`);
    }

    if (input.responseType === 'text') return await res.text();
    return await res.json();
  };
}

export function registerServerApiApis(registry: ApiRegistry) {
  const dynamic = new Map<string, RegisterServerApiOutput>();

  const register: EndpointDefinition<RegisterServerApiInput, RegisterServerApiOutput> = {
    name: 'register',
    handler: async (input) => {
      const namespace = String(input?.namespace ?? '').trim();
      const name = String(input?.name ?? '').trim();
      const url = String(input?.url ?? '').trim();

      if (!namespace) throw new Error('serverApi.register: namespace is required');
      if (!name) throw new Error('serverApi.register: name is required');
      if (!url) throw new Error('serverApi.register: url is required');

      if (RESERVED_ROOT_KEYS.has(namespace)) {
        throw new Error(`serverApi.register: namespace "${namespace}" is reserved`);
      }
      if (!isValidIdentifier(namespace)) {
        throw new Error(`serverApi.register: invalid namespace "${namespace}" (use [a-zA-Z0-9_] and not starting with a digit)`);
      }
      if (!isValidIdentifier(name)) {
        throw new Error(`serverApi.register: invalid name "${name}" (use [a-zA-Z0-9_] and not starting with a digit)`);
      }
      if (!url.startsWith('/')) {
        throw new Error('serverApi.register: url should start with "/" (relative to current origin)');
      }

      const method = normalizeMethod(input?.method);
      const responseType = normalizeResponseType(input?.responseType);
      const useRequestHeaders = input?.useRequestHeaders !== false;
      const contentType = String(input?.contentType ?? 'application/json');

      const handler = makeFetchHandler({
        url,
        method,
        useRequestHeaders,
        headers: input?.headers,
        contentType,
        responseType,
      });

      registry.registerModule({
        namespace,
        endpoints: [{ name, handler }],
      });

      // Ensure window.ST_API gets the namespace reference even if it didn't exist at init time.
      const nsObj = registry.getNamespaceObject(namespace);
      if (window.ST_API) {
        (window.ST_API as any)[namespace] = nsObj;
      }

      const fullName = `${namespace}.${name}`;
      const rec: RegisterServerApiOutput = {
        ok: true,
        fullName,
        namespace,
        name,
        url,
        method,
        contentType,
        responseType,
      };
      dynamic.set(fullName, rec);
      return rec;
    },
  };

  const list: EndpointDefinition<void, ListServerApiOutput> = {
    name: 'list',
    handler: async () => {
      return {
        ok: true,
        endpoints: Array.from(dynamic.values()).sort((a, b) => a.fullName.localeCompare(b.fullName)),
      };
    },
  };

  const unregister: EndpointDefinition<UnregisterServerApiInput, UnregisterServerApiOutput> = {
    name: 'unregister',
    handler: async (input) => {
      const fullName = String(input?.fullName ?? '').trim()
        || `${String(input?.namespace ?? '').trim()}.${String(input?.name ?? '').trim()}`;
      if (!fullName.includes('.')) throw new Error('serverApi.unregister: fullName (namespace.endpoint) is required');

      const removed = registry.unregister(fullName);
      dynamic.delete(fullName);
      return { ok: true, fullName, removed };
    },
  };

  const moduleDef: ApiModuleDefinition = {
    namespace: 'serverApi',
    endpoints: [register, list, unregister],
  };
  registry.registerModule(moduleDef);
}

