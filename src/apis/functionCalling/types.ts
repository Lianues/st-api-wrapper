export type JsonSchemaObject = Record<string, any>;

export interface IsSupportedOutput {
  /** 当前 API/设置是否允许工具调用（Function Calling） */
  supported: boolean;
}

export interface SetEnabledInput {
  /** 是否开启 */
  enabled: boolean;
}

export interface SetEnabledOutput {
  ok: boolean;
  enabled: boolean;
  /** 修改后再次探测：是否支持工具调用（受模型/后处理/主 API 等影响） */
  supported: boolean;
  error?: string;
}

export interface RegisterFunctionToolInput {
  /**
   * 工具内部名称（必须唯一）
   *
   * 说明：这是 LLM 侧真正会调用的 tool name。
   */
  name: string;

  /**
   * 显示名称（会在 UI 中展示，可选）
   */
  displayName?: string;

  /**
   * 工具描述（请清晰描述“什么时候用、做什么”）
   */
  description: string;

  /**
   * JSON Schema（draft-04 风格；与酒馆原生 registerFunctionTool 一致）
   */
  parameters: JsonSchemaObject;

  /**
   * 工具执行逻辑：允许同步或异步。
   *
   * - 若返回非 string，酒馆会 JSON.stringify 后写入 tool result。
   */
  action: (params: Record<string, any>) => any | Promise<any>;

  /**
   * 可选：格式化 toast 文案；返回空字符串可禁用 toast。
   */
  formatMessage?: (params: Record<string, any>) => string | Promise<string>;

  /**
   * 可选：决定“本次请求”是否把工具注册到 prompt tools 列表。
   */
  shouldRegister?: () => boolean | Promise<boolean>;

  /**
   * 可选：stealth 工具不会写入可见聊天，也不会触发后续 follow-up generation。
   * @default false
   */
  stealth?: boolean;

  /**
   * Wrapper 行为：当同名工具已存在时，是否允许覆盖。
   *
   * - 酒馆原生行为：允许覆盖，但会 console.warn
   * - wrapper 默认：不允许覆盖（更安全）
   *
   * @default false
   */
  allowOverwrite?: boolean;
}

export interface RegisterFunctionToolOutput {
  ok: boolean;
  name: string;
  overwritten?: boolean;
  registeredAt?: number;
  error?: string;
}

export interface UnregisterFunctionToolInput {
  name: string;

  /**
   * 是否强制注销：
   * - false：只允许注销“由本 wrapper 注册过”的工具（防误伤）
   * - true：无论来源都尝试注销
   * @default false
   */
  force?: boolean;
}

export interface UnregisterFunctionToolOutput {
  ok: boolean;
  name: string;
  existed?: boolean;
  error?: string;
}

export interface FunctionToolInfo {
  name: string;
  displayName?: string;
  description: string;
  parameters: JsonSchemaObject;
  stealth: boolean;

  /** 是否由本 wrapper 注册（用于安全注销/过滤列表） */
  registeredByWrapper: boolean;

  /** 仅当 registeredByWrapper=true 时存在 */
  registeredAt?: number;
}

export interface ListFunctionToolsInput {
  /**
   * 仅列出通过本 wrapper 注册的工具。
   * @default false
   */
  onlyRegisteredByWrapper?: boolean;
}

export interface ListFunctionToolsOutput {
  tools: FunctionToolInfo[];
}

export interface GetFunctionToolInput {
  name: string;
}

export interface GetFunctionToolOutput {
  ok: boolean;
  tool?: FunctionToolInfo;
  error?: string;
}

export interface InvokeFunctionToolInput {
  name: string;
  /** 传给 tool 的参数对象（或 JSON 字符串；与酒馆原生一致） */
  parameters?: any;
}

export interface InvokeFunctionToolOutput {
  ok: boolean;
  name: string;
  result?: string;
  error?: string;
}
