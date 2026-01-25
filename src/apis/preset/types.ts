import type { RegexScriptData } from '../regexScript/types';

export interface PromptInfo {
  /** 唯一标识符 */
  identifier: string;
  /** 名称 */
  name: string;
  /** 是否启用 (优先使用 order 中的状态) */
  enabled: boolean;
  /** 
   * 在预设顺序列表中的索引位置 (从 0 开始)。
   * 如果该 Prompt 未被加载到顺序列表中，则该字段为 undefined。
   */
  index?: number;
  /** 角色: system, user, assistant 等 */
  role: string;
  /** 内容文本 */
  content: string;
  /** 注入深度 */
  depth: number;
  /** 注入顺序 */
  order: number;
  /** 注入触发器 */
  trigger: any[];
  /** 
   * 注入位置类型
   * - 'relative': 相对位置 (原 injection_position = 0)
   * - 'fixed': 固定位置 (原 injection_position = 1)
   */
  position: 'relative' | 'fixed';
  /** 其他原始属性 (如 marker, forbid_overrides 等) */
  [key: string]: any;
}

/**
 * Utility Prompts：从 `other`（原 `apiSetting`）中迁移出来的一组常用字段。
 *
 * 这些字段通常对应酒馆 OpenAI 预设面板里的 “Utility Prompts / Format Templates” 一组配置。
 */
export interface UtilityPrompts {
  /** impersonation_prompt：用于“代入/扮演（Impersonation）”功能的提示词 */
  impersonationPrompt?: string;

  /** wi_format：世界书条目插入格式模板。用 `{0}` 标记插入点 */
  worldInfoFormat?: string;

  /** scenario_format：场景格式模板。通常包含 `{{scenario}}` */
  scenarioFormat?: string;

  /** personality_format：人设/性格格式模板。通常包含 `{{personality}}` */
  personalityFormat?: string;

  /** group_nudge_prompt：群聊末尾用于“强制某角色回复”的提示词模板 */
  groupNudgePrompt?: string;

  /** new_chat_prompt：聊天历史开头用于标识“新聊天”的提示词 */
  newChatPrompt?: string;

  /** new_group_chat_prompt：群聊历史开头用于标识“新群聊”的提示词 */
  newGroupChatPrompt?: string;

  /** new_example_chat_prompt：示例对话开头用于标识“新示例聊天”的提示词 */
  newExampleChatPrompt?: string;

  /** continue_nudge_prompt：点击 Continue 时追加到历史末尾的提示词 */
  continueNudgePrompt?: string;

  /** send_if_empty：当输入框为空时，用该文本替代空消息 */
  sendIfEmpty?: string;

  /** seed：随机种子。-1 表示随机 */
  seed?: number;
}

export interface PresetInfo {
  /** 预设名称 */
  name: string;
  /** 合并后的 Prompt 列表 */
  prompts: PromptInfo[];

  /**
   * Utility Prompts：从 `other`（原 `apiSetting`）中迁移出来的常用字段（camelCase 命名，便于直接读取）。
   *
   * 注意：该字段会从返回的 `other` 中移除，避免重复与混淆；保存/注入时会写回酒馆原始键名。
   */
  utilityPrompts: UtilityPrompts;

  /**
   * 预设绑定的正则脚本（来源：`other.extensions.regex_scripts`）。
   * 已按 `regexScript` 模块做结构简化与字段映射。
   */
  regexScripts: RegexScriptData[];

  /**
   * 其他采样参数（如温度、Top P 等，排除了 prompts 和 prompt_order）。
   *
   * 备注：该字段原名为 `apiSetting`，已重命名为 `other`。
   */
  other: any;
}

export interface GetPresetInput {
  /** 可选：预设名称。如果传了，则获取特定预设；如果不传，则获取当前激活的预设。 */
  name?: string;
}

export interface GetPresetOutput {
  /** 单个预设对象，找不到则为 null */
  preset: PresetInfo | null;
}

export interface ListPresetsOutput {
  /** 全量预设详情列表 */
  presets: PresetInfo[];
  /** 当前激活的预设名称 */
  active: string;
}

export interface CreatePresetInput {
  /** 新预设的名称 */
  name: string;
  /** 可选：采样参数 */
  other?: any;
  /**
   * 可选：Utility Prompts（推荐放这里，不要混在 other 里）。
   * 这些字段保存时会写回酒馆原始键名（如 `new_chat_prompt`、`wi_format` 等）。
   */
  utilityPrompts?: UtilityPrompts;
  /** 可选：Prompt 列表 */
  prompts?: Partial<PromptInfo>[];
  /** 可选：预设绑定正则脚本列表（将写入 other.extensions.regex_scripts） */
  regexScripts?: RegexScriptData[];
}

export interface CreatePresetOutput {
  success: boolean;
  name: string;
}

export interface UpdatePresetInput {
  /** 要更新的预设名称 (必填) */
  name: string;
  /** 新的预设名称 (可选，用于重命名) */
  newName?: string;
  /** 采样参数 (可选，部分更新) */
  other?: any;
  /**
   * 可选：Utility Prompts（推荐放这里，不要混在 other 里）。
   * 这些字段保存时会写回酒馆原始键名（如 `new_chat_prompt`、`wi_format` 等）。
   */
  utilityPrompts?: UtilityPrompts;
  /** Prompt 列表 (可选，全量替换) */
  prompts?: Partial<PromptInfo>[];
  /** 可选：预设绑定正则脚本列表（将写入 other.extensions.regex_scripts） */
  regexScripts?: RegexScriptData[];
}

export interface UpdatePresetOutput {
  success: boolean;
}

export interface DeletePresetInput {
  /** 要删除的预设名称 */
  name: string;
}

export interface DeletePresetOutput {
  success: boolean;
}

// --- Prompt 条目操作相关 ---

export interface CreatePromptInput {
  /** 目标预设名称。如果不传，则使用当前活跃预设。 */
  presetName?: string;
  /** 要创建的 Prompt 数据 (identifier 可选，不传则自动生成) */
  prompt: Partial<PromptInfo>;
}

export interface CreatePromptOutput {
  success: boolean;
  prompt: PromptInfo;
}

export interface UpdatePromptInput {
  /** 目标预设名称。如果不传，则使用当前活跃预设。 */
  presetName?: string;
  /** 要更新的 Prompt 唯一标识符 */
  identifier: string;
  /** 要更新的字段 */
  update: Partial<Omit<PromptInfo, 'identifier'>>;
}

export interface UpdatePromptOutput {
  success: boolean;
  prompt: PromptInfo;
}

export interface DeletePromptInput {
  /** 目标预设名称。如果不传，则使用当前活跃预设。 */
  presetName?: string;
  /** 要删除的 Prompt 唯一标识符 */
  identifier: string;
}

export interface DeletePromptOutput {
  success: boolean;
}

export interface GetPromptInput {
  /** 目标预设名称。如果不传，则使用当前活跃预设。 */
  presetName?: string;
  /** 要获取的 Prompt 唯一标识符 */
  identifier: string;
}

export interface GetPromptOutput {
  prompt: PromptInfo;
}
