/**
 * 斜杠指令参数类型
 */
export type SlashCommandArgumentType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'variable'
  | 'closure'
  | 'list'
  | 'dictionary';

/**
 * 命名参数定义
 */
export interface SlashCommandNamedArgument {
  /** 参数名称 */
  name: string;
  /** 参数描述 */
  description?: string;
  /** 参数类型列表 */
  typeList?: SlashCommandArgumentType[];
  /** 是否必需 */
  isRequired?: boolean;
  /** 默认值 */
  defaultValue?: string;
  /** 枚举值列表（当 typeList 包含 'enum' 时使用） */
  enumList?: string[];
  /** 是否接受变量 */
  acceptsMultiple?: boolean;
}

/**
 * 未命名参数定义
 */
export interface SlashCommandUnnamedArgument {
  /** 参数描述 */
  description?: string;
  /** 参数类型列表 */
  typeList?: SlashCommandArgumentType[];
  /** 是否必需 */
  isRequired?: boolean;
  /** 默认值 */
  defaultValue?: string;
  /** 枚举值列表 */
  enumList?: string[];
  /** 是否接受多个值 */
  acceptsMultiple?: boolean;
}

/**
 * 斜杠指令执行上下文
 */
export interface SlashCommandContext {
  /** 命名参数 */
  namedArgs: Record<string, unknown>;
  /** 未命名参数（字符串形式） */
  unnamedArgs: string;
  /** 解析后的未命名参数数组 */
  unnamedArgsList?: unknown[];
  /** 原始输入 */
  rawInput?: string;
  /** 执行范围 */
  scope?: unknown;
  /** 管道值 */
  value?: unknown;
}

/**
 * 斜杠指令回调函数
 */
export type SlashCommandCallback = (
  context: SlashCommandContext
) => string | void | Promise<string | void>;

/**
 * 注册斜杠指令的输入参数
 */
export interface RegisterSlashCommandInput {
  /**
   * 指令名称（不包含斜杠前缀）
   * 例如: 'mycommand' 将注册为 /mycommand
   */
  name: string;

  /**
   * 指令回调函数
   */
  callback: SlashCommandCallback;

  /**
   * 指令别名列表
   */
  aliases?: string[];

  /**
   * 帮助文本，显示在指令帮助中
   */
  helpString?: string;

  /**
   * 是否中断生成
   * 如果为 true，执行此指令会中断 AI 回复生成
   * @default false
   */
  interruptsGeneration?: boolean;

  /**
   * 是否从消息中清除指令
   * 如果为 true，指令执行后会从消息中移除
   * @default true
   */
  purgeFromMessage?: boolean;

  /**
   * 未命名参数定义
   */
  unnamedArgumentList?: SlashCommandUnnamedArgument[];

  /**
   * 命名参数定义
   */
  namedArgumentList?: SlashCommandNamedArgument[];

  /**
   * 指令返回类型描述
   */
  returns?: string;

  /**
   * 是否隐藏（不显示在帮助列表中）
   * @default false
   */
  hidden?: boolean;
}

/**
 * 注册斜杠指令的输出
 */
export interface RegisterSlashCommandOutput {
  /** 注册的指令名称 */
  name: string;
  /** 是否注册成功 */
  ok: boolean;
}

/**
 * 注销斜杠指令的输入参数
 */
export interface UnregisterSlashCommandInput {
  /** 指令名称 */
  name: string;
}

/**
 * 注销斜杠指令的输出
 */
export interface UnregisterSlashCommandOutput {
  ok: boolean;
}

/**
 * 列出所有斜杠指令的输出
 */
export interface ListSlashCommandsOutput {
  /** 指令列表 */
  commands: Array<{
    name: string;
    aliases: string[];
    helpString?: string;
  }>;
}

/**
 * 执行斜杠指令的输入参数
 */
export interface ExecuteSlashCommandInput {
  /**
   * 要执行的指令文本（包含斜杠前缀）
   * 例如: '/echo Hello World' 或多行脚本
   */
  command: string;

  /**
   * 是否显示输出到聊天中
   * @default false
   */
  showOutput?: boolean;
}

/**
 * 执行斜杠指令的输出
 */
export interface ExecuteSlashCommandOutput {
  /** 执行是否成功 */
  ok: boolean;
  /** 指令返回值（管道结果） */
  result?: string;
  /** 错误信息 */
  error?: string;
}
