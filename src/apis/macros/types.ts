export type MacroValueType = 'string' | 'integer' | 'number' | 'boolean';

export interface MacroAliasDef {
  /** 别名名称 */
  alias: string;
  /**
   * 是否在文档/自动补全中可见
   * @default true
   */
  visible?: boolean;
}

export interface MacroUnnamedArgDef {
  /** 参数名（用于文档展示） */
  name: string;
  /** 是否可选（可选参数必须为后缀） */
  optional?: boolean;
  /** 可选参数默认值（仅 optional=true 时有意义） */
  defaultValue?: string;
  /** 类型（单个或多个） */
  type?: MacroValueType | MacroValueType[];
  /** 示例值 */
  sampleValue?: string;
  /** 参数描述 */
  description?: string;
}

export interface MacroListSpec {
  /** list 最小长度 */
  min?: number;
  /** list 最大长度 */
  max?: number;
}

export interface MacroSourceInfo {
  name: string;
  isExtension: boolean;
  isThirdParty: boolean;
}

/**
 * MacroEngine 执行上下文（精简版类型；运行时结构由酒馆提供）
 */
export interface MacroExecutionContext {
  name: string;
  args: string[];
  unnamedArgs: string[];
  list: string[] | null;
  namedArgs: Record<string, string> | null;
  raw: string;
  env: any;
  cstNode: any;
  range: { startOffset: number; endOffset: number } | null;
  normalize: (value: any) => string;
}

export type MacroHandler = (ctx: MacroExecutionContext) => any;

export interface RegisterMacroOptions {
  aliases?: MacroAliasDef[];
  /**
   * 分类（用于文档/自动补全分组）。不传时默认使用 'custom'。
   */
  category?: string;
  /**
   * 未命名参数定义：
   * - number：全部必填
   * - MacroUnnamedArgDef[]：支持 optional/default 等
   */
  unnamedArgs?: number | MacroUnnamedArgDef[];
  /**
   * 是否允许 list 参数（位于 unnamedArgs 之后）
   * - true：开启无限 list
   * - {min,max}：限制 list 长度
   */
  list?: boolean | MacroListSpec;
  /**
   * 是否严格校验参数数量
   * @default true
   */
  strictArgs?: boolean;
  /** 宏描述 */
  description?: string;
  /** 返回值描述 */
  returns?: string;
  /** 返回值类型 */
  returnType?: MacroValueType | MacroValueType[];
  /** 覆盖显示签名（需包含 {{}}） */
  displayOverride?: string;
  /** 示例用法（需包含 {{}}；可传多个） */
  exampleUsage?: string | string[];
  /** 宏处理器（必须同步，返回 Promise 会被忽略） */
  handler: MacroHandler;
}

export interface RegisterMacroInput {
  /** 宏名称（不需要包含 {{}}） */
  name: string;
  /** 宏定义选项 */
  options: RegisterMacroOptions;
  /**
   * 是否允许覆盖同名宏（包含内置宏/其他插件宏）
   * @default false
   */
  allowOverwrite?: boolean;
  /**
   * 是否同时注册到旧版宏系统（MacrosParser.registerMacro），用于在未开启 experimental_macro_engine 时，
   * 让一些“页面即时替换/预览”场景也能识别你的自定义宏。
   *
   * 注意：旧版注册仅支持 **0 参数宏**（即只能用 `{{name}}` 形式）。带参数宏需要开启新宏引擎或使用 `macros.process({ forceNewEngine: true })`。
   * @default false
   */
  registerLegacy?: boolean;
  /**
   * 是否在注册时自动开启 `experimental_macro_engine`（并触发保存），从而让带 `::` 参数的自定义宏
   * 能参与酒馆默认的 `substituteParams(...)` 流程（例如发送消息、提示词模板渲染、部分“即时替换”场景）。
   *
   * 说明：像 `{{setvar::a::1}}` 这类宏在旧引擎也能工作，是因为它属于酒馆内置的 legacy 变量宏（正则实现）。
   * 自定义“参数宏”要想像它一样自动生效，通常需要启用新宏引擎。
   *
   * @default true
   */
  ensureExperimentalMacroEngine?: boolean;
}

export type RegisterMacroEngine = 'macroEngine' | 'legacy';

export interface RegisterMacroOutput {
  ok: boolean;
  name: string;
  /** 实际注册的名字集合（包含 aliases） */
  registeredNames: string[];
  /** 实际注册到的引擎列表 */
  engines?: RegisterMacroEngine[];
  error?: string;
}

export interface UnregisterMacroInput {
  /** 宏名称（可传 alias） */
  name: string;
  /**
   * 是否强制注销：当宏并非由本 wrapper 注册时，也尝试注销。
   * @default false
   */
  force?: boolean;
}

export interface UnregisterMacroOutput {
  ok: boolean;
  removed: string[];
  error?: string;
}

export interface ListMacrosInput {
  excludeAliases?: boolean;
  excludeHiddenAliases?: boolean;
  /**
   * 仅列出通过本 wrapper 注册的宏（包含其 aliases）。
   * @default false
   */
  onlyRegisteredByWrapper?: boolean;
}

export interface MacroDefinitionSerializable {
  name: string;
  aliases: Array<{ alias: string; visible: boolean }>;
  category: string;
  minArgs: number;
  maxArgs: number;
  unnamedArgDefs: MacroUnnamedArgDef[];
  list: { min: number; max: number | null } | null;
  strictArgs: boolean;
  description: string;
  returns: string | null;
  returnType: MacroValueType | MacroValueType[];
  displayOverride: string | null;
  exampleUsage: string[];
  source?: MacroSourceInfo;
  aliasOf: string | null;
  aliasVisible: boolean | null;
  registeredByWrapper: boolean;
}

export interface ListMacrosOutput {
  macros: MacroDefinitionSerializable[];
}

export interface ProcessMacrosOptions {
  name1Override?: string;
  name2Override?: string;
  original?: string;
  groupOverride?: string;
  replaceCharacterCard?: boolean;
  dynamicMacros?: Record<string, string | MacroHandler>;
  postProcessFn?: (x: string) => string;
}

export interface ProcessMacrosInput {
  /** 要处理的文本 */
  text: string;
  /** substituteParams / MacroEnvBuilder 参数 */
  options?: ProcessMacrosOptions;
  /**
   * 强制使用新版 MacroEngine 处理，不受 experimental_macro_engine 开关影响。
   * @default false
   */
  forceNewEngine?: boolean;
}

export interface ProcessMacrosOutput {
  ok: boolean;
  text: string;
  engine: 'substituteParams' | 'macroEngine';
  error?: string;
}

