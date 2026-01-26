export type ServerApiHttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export type ServerApiResponseType = 'json' | 'text';

export interface RegisterServerApiInput {
  /**
   * 注册到 ST_API 的命名空间，例如：
   * - namespace: "myBackend"
   * - name: "probe"
   * 调用方式：ST_API.myBackend.probe(...)
   */
  namespace: string;
  /** endpoint 名称（不含 namespace） */
  name: string;
  /** 后端 URL（通常以 `/` 开头，例如 `/api/plugins/xxx/probe`） */
  url: string;

  /** HTTP 方法（默认 POST） */
  method?: ServerApiHttpMethod;

  /** 是否自动附带酒馆鉴权/CSRF 请求头（默认 true） */
  useRequestHeaders?: boolean;

  /** 额外 headers（可选；会覆盖同名 header） */
  headers?: Record<string, string>;

  /** 请求 Content-Type（默认 application/json；GET/HEAD 会忽略 body） */
  contentType?: string;

  /** 响应解析方式（默认 json） */
  responseType?: ServerApiResponseType;
}

export interface RegisterServerApiOutput {
  ok: boolean;
  fullName: string;
  namespace: string;
  name: string;
  url: string;
  method: ServerApiHttpMethod;
  contentType: string;
  responseType: ServerApiResponseType;
}

export interface ListServerApiOutput {
  ok: boolean;
  endpoints: Array<RegisterServerApiOutput>;
}

export interface UnregisterServerApiInput {
  /** 完整名：`namespace.endpoint`（优先） */
  fullName?: string;
  namespace?: string;
  name?: string;
}

export interface UnregisterServerApiOutput {
  ok: boolean;
  fullName: string;
  removed: boolean;
}

