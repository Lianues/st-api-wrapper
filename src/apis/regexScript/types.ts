export type RegexTarget = 'userInput' | 'aiOutput' | 'slashCommands' | 'worldBook' | 'reasoning';

export type RegexView = 'user' | 'model';

export type RegexMacroMode = 'none' | 'raw' | 'escaped';

export interface RegexScriptData {
  /** 唯一标识符 */
  id: string;
  /** 脚本名称 */
  name: string;
  /** 是否启用 */
  enabled: boolean;
  /** 查找正则 */
  findRegex: string;
  /** 替换文本 */
  replaceRegex: string;
  /** 修剪文本列表 */
  trimRegex: string[];
  /** 作用位置列表 */
  targets: RegexTarget[];
  /** 视图过滤列表。user_view: 仅显示(Markdown), model_view: 仅发送给AI(Prompt) */
  view: RegexView[];
  /** 是否在编辑时运行 */
  runOnEdit: boolean;
  /** 宏替换模式 */
  macroMode: RegexMacroMode;
  /** 最小深度 */
  minDepth: number | null;
  /** 最大深度 */
  maxDepth: number | null;
}

export type RegexScope = 'global' | 'character' | 'preset';

export interface GetInput {
  /** 脚本 ID 或脚本名称 */
  idOrName: string;
  /**
   * 可选：限定作用域。
   * - 不传：按 global -> character -> preset 顺序查找第一个匹配项
   * - 传入：只在该 scope 中查找
   */
  scope?: RegexScope;
  /** 仅返回已启用的脚本 (默认: false) */
  allowedOnly?: boolean;
}

export interface GetOutput {
  /** 找不到时为 null */
  regexScript: RegexScriptData | null;
  /** 找不到时为 null */
  scope: RegexScope | null;
}

export interface ListInput {
  /** 仅返回已启用的脚本 (默认: false) */
  allowedOnly?: boolean;
  /** 是否包含全局脚本 (默认: true) */
  includeGlobal?: boolean;
  /** 是否包含角色专用脚本 (默认: true) */
  includeCharacter?: boolean;
  /** 是否包含预设专用脚本 (默认: true) */
  includePreset?: boolean;
}

export interface ListOutput {
  regexScripts: RegexScriptData[];
}

export interface ProcessInput {
  /** 要处理的文本 */
  text: string;
  /** 处理位置 (Placement) */
  placement: number;
}

export interface ProcessOutput {
  /** 处理后的文本 */
  text: string;
}

export interface RunInput {
  /** 脚本 ID 或名称 */
  idOrName: string;
  /** 要处理的文本 */
  text: string;
}

export interface CreateInput {
  /** 作用域: 'global', 'character', 'preset'。如果不传，则按 全局->角色->预设 顺序查找 (但在创建时通常需要明确指明) */
  scope?: RegexScope;
  /** 正则脚本数据 */
  regexScript: Partial<Omit<RegexScriptData, 'id'>>;
}

export interface CreateOutput {
  success: boolean;
  regexScript: RegexScriptData;
}

export interface UpdateInput {
  /** 脚本 ID */
  id: string;
  /** 作用域。如果不传，则按 全局->角色->预设 顺序查找第一个匹配 ID 的脚本进行更新 */
  scope?: RegexScope;
  /** 要更新的字段 */
  regexScript: Partial<RegexScriptData>;
}

export interface UpdateOutput {
  success: boolean;
  regexScript: RegexScriptData;
}

export interface DeleteInput {
  /** 脚本 ID */
  id: string;
  /** 作用域。如果不传，则按 全局->角色->预设 顺序查找第一个匹配 ID 的脚本进行删除 */
  scope?: RegexScope;
}

export interface DeleteOutput {
  success: boolean;
}
