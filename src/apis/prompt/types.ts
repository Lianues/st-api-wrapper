import type { PromptResult } from '../../types';
import type { ChatMessage } from '../../types';
import type { PresetInfo } from '../preset/types';
import type { WorldBook } from '../worldBook/types';

export interface GetPromptInput {
  /**
   * 超时（毫秒）。超时后会 reject。
   * @default 8000
   */
  timeoutMs?: number;

  /**
   * 可选：强制指定角色 ID（chid）。不传则使用当前选中角色。
   */
  forceCharacterId?: number;
}

export type GetPromptOutput = PromptResult;

export type PresetMode = 'current' | 'disable';
export type WorldBookMode = 'current' | 'disable';

export interface RequestPresetOption {
  /**
   * 预设使用策略：
   * - current：使用当前酒馆预设（不做改动）
   * - disable：临时把当前 prompts 全部置为 disabled（仅影响本次请求）
   * @default 'current'
   */
  mode?: PresetMode;

  /**
   * 注入（合并）预设：将你提供的 PresetInfo 作为 patch 合并到当前预设里（同名 identifier 覆盖）。
   * 与 replace 互斥。
   */
  inject?: PresetInfo;

  /**
   * 替换预设：本次请求整体替换为你提供的 PresetInfo。
   * 与 inject 互斥。
   */
  replace?: PresetInfo;
}

export interface RequestWorldBookOption {
  /**
   * 世界书使用策略：
   * - current：使用当前世界书设置
   * - disable：不使用世界书（通过 `skipWIAN`，同时跳过作者注释）
   * @default 'current'
   */
  mode?: WorldBookMode;

  /**
   * 注入（合并）世界书：将你提供的 WorldBook 条目合并到当前 chat lorebook（同名 comment 覆盖）。
   * 与 replace 互斥。
   */
  inject?: WorldBook;

  /**
   * 替换世界书：本次请求使用你提供的 WorldBook 作为 chat lorebook（结束会回滚，不落盘）。
   * 与 inject 互斥。
   */
  replace?: WorldBook;
}

export interface RequestChatHistoryOption {
  /**
   * 完整替换聊天记录（优先级最高）。
   * 你可以理解为：本次 dry-run 临时换了一份“聊天历史”。结束会自动回滚。
   */
  replace?: ChatMessage[];

  /**
   * 按 depth/order 注入“历史块”（不替换聊天记录）。
   * 你可以理解为：临时插入了一组“带 depth/order 的 history 块”，类似预设/世界书的注入逻辑。
   * 只对本次 build 生效，结束会自动回滚。
   */
  inject?: ChatHistoryInjection[];
}

export interface ChatHistoryInjection {
  /** 要注入的消息（wrapper ChatMessage 格式） */
  message: ChatMessage;

  /**
   * 插入深度（从末尾开始计数，等价 gap index）：
   * - 0：最后一个消息之后
   * - 1：最后一个与倒数第二个之间
   * - ...
   * 默认 0
   */
  depth?: number;

  /**
   * 同一 depth 下的排序（越小越靠前）。默认 100。
   */
  order?: number;
}

export type ExtraBlockInsert =
  | 'head'
  | 'tail'
  | 'afterSystem'
  | 'beforeLastUser'
  | 'beforeLastAssistant';

export interface ExtraMessageBlock {
  role: string;
  content: string;
  name?: string;
  /**
   * 插入到最终 `messages[]` 的“间隙”索引（从末尾开始计数）。
   * - 0：最后一个消息块之后（append）
   * - 1：最后一个与倒数第二个之间
   * - ...
   * - messages.length：第一个消息块之前（prepend）
   *
   * 若不传，默认 0。
   */
  index?: number;

  /**
   * @deprecated 旧版插入方式（按语义位置）。建议改用 index。
   */
  insert?: ExtraBlockInsert;
}

export interface BuildRequestInput {
  /**
   * 超时（毫秒）。
   * @default 8000
   */
  timeoutMs?: number;

  /**
   * 可选：强制指定角色 ID（chid）。不传则使用当前选中角色。
   */
  forceCharacterId?: number;

  /**
   * 预设策略：当前 / 禁用 / 注入(合并) / 替换
   * @default { mode: 'current' }
   */
  preset?: RequestPresetOption;

  /**
   * 世界书策略：当前 / 禁用 / 注入(合并) / 替换
   * @default { mode: 'current' }
   */
  worldBook?: RequestWorldBookOption;

  /**
   * 聊天记录使用策略：当前 / 注入
   * @default { mode: 'current' }
   */
  chatHistory?: RequestChatHistoryOption;

  /**
   * 额外的 role/content 消息段插入（不强依赖酒馆内部格式）
   */
  extraBlocks?: ExtraMessageBlock[];

  /**
   * 是否尝试构造与后端一致的 payload（generate_data）
   * - openai: createGenerationParameters
   * - textgen: getTextGenGenerationData
   * @default false
   */
  includeGenerateData?: boolean;
}

export type ChatCompletionMessage = {
  role: string;
  content: string;
  name?: string;
  [key: string]: any;
};

export interface BuildRequestOutput {
  timestamp: number;
  characterId?: number;

  /** Chat Completions: 最终消息数组（可直接用于请求构造） */
  chatCompletionMessages?: ChatCompletionMessage[];

  /** Text Completions: 最终 prompt 字符串 */
  textPrompt?: string;

  /** 可选：与酒馆后端一致的 payload（generate_data） */
  generateData?: any;
}

export type PromptGenerateFrom = 'inChat' | 'background';

export type PromptStreamTokenCallback = (delta: string, full: string) => void;

export interface GenerateInput extends BuildRequestInput {
  /**
   * 是否将生成结果写入当前聊天。
   * - true: 走酒馆原生生成流程（会影响聊天与 UI）
   * - false: 后台生成，仅返回文本
   * @default false
   */
  writeToChat?: boolean;

  /**
   * 是否启用 token 流式回调。
   * - writeToChat=true 时：通过监听 STREAM_TOKEN_RECEIVED 提供流式
   * - writeToChat=false 时：仅“尽力而为”（通常只会在结束时回调一次 full 文本）
   * @default false
   */
  stream?: boolean;

  /**
   * token 流式回调（delta 为本次新增片段，full 为当前累计内容）
   */
  onToken?: PromptStreamTokenCallback;

  /**
   * 是否在输出中附带本次使用的请求构造结果（messages/prompt/generateData）
   * @default false
   */
  includeRequest?: boolean;
}

export interface GenerateOutput {
  timestamp: number;
  characterId?: number;

  /** 最终生成文本 */
  text: string;

  /** 生成来源：写入聊天 or 后台 */
  from: PromptGenerateFrom;

  /** 可选：本次使用的请求构造结果（便于调试） */
  request?: BuildRequestOutput;
}
