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

export interface PresetInfo {
  /** 预设名称 */
  name: string;
  /** 合并后的 Prompt 列表 */
  prompts: PromptInfo[];

  /**
   * 预设绑定的正则脚本（来源：`apiSetting.extensions.regex_scripts`）。
   * 已按 `regexScript` 模块做结构简化与字段映射。
   */
  regexScripts: RegexScriptData[];

  /** 采样参数（如温度、Top P 等，排除了 prompts 和 prompt_order） */
  apiSetting: any;
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
  apiSetting?: any;
  /** 可选：Prompt 列表 */
  prompts?: Partial<PromptInfo>[];
  /** 可选：预设绑定正则脚本列表（将写入 apiSetting.extensions.regex_scripts） */
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
  apiSetting?: any;
  /** Prompt 列表 (可选，全量替换) */
  prompts?: Partial<PromptInfo>[];
  /** 可选：预设绑定正则脚本列表（将写入 apiSetting.extensions.regex_scripts） */
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
