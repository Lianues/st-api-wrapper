import type {
  GetPresetInput,
  GetPresetOutput,
  ListPresetsOutput,
  PresetInfo,
  UtilityPrompts,
  CreatePresetInput,
  CreatePresetOutput,
  UpdatePresetInput,
  UpdatePresetOutput,
  DeletePresetInput,
  DeletePresetOutput,
  PromptInfo,
  CreatePromptInput,
  CreatePromptOutput,
  UpdatePromptInput,
  UpdatePromptOutput,
  DeletePromptInput,
  DeletePromptOutput,
  GetPromptInput,
  GetPromptOutput,
} from './types';
import type { RegexScriptData } from '../regexScript/types';
import { fromStRegex, toStRegex } from '../regexScript/utils';

const CHAT_API_TYPE = 'openai';

function readString(v: any): string | undefined {
  if (v === undefined || v === null) return undefined;
  return typeof v === 'string' ? v : String(v);
}

function readNumber(v: any): number | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function getFirstDefined(obj: any, keys: string[]) {
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
      return obj[k];
    }
  }
  return undefined;
}

const UTILITY_PROMPT_KEYS = [
  // snake_case (ST)
  'impersonation_prompt',
  'wi_format',
  'scenario_format',
  'personality_format',
  'group_nudge_prompt',
  'new_chat_prompt',
  'new_group_chat_prompt',
  'new_example_chat_prompt',
  'continue_nudge_prompt',
  'send_if_empty',
  'seed',

  // camelCase aliases (best-effort)
  'impersonationPrompt',
  'wiFormat',
  'worldInfoFormat',
  'scenarioFormat',
  'personalityFormat',
  'groupNudgePrompt',
  'newChatPrompt',
  'newGroupChatPrompt',
  'newExampleChatPrompt',
  'continueNudgePrompt',
  'sendIfEmpty',
] as const;

function stripUtilityPromptFields(other: any) {
  if (!other || typeof other !== 'object' || Array.isArray(other)) return;
  for (const k of UTILITY_PROMPT_KEYS) {
    if (Object.prototype.hasOwnProperty.call(other, k)) {
      delete other[k];
    }
  }
}

function assertNoUtilityPromptFieldsInOther(other: any, where: string) {
  if (!other || typeof other !== 'object' || Array.isArray(other)) return;
  const found = UTILITY_PROMPT_KEYS.find((k) => Object.prototype.hasOwnProperty.call(other, k));
  if (!found) return;
  throw new Error(`[ST API] ${where}: Utility prompt field "${String(found)}" is not allowed in "other". Please put it in "utilityPrompts" instead.`);
}

function mergeUtilityPrompts(base: UtilityPrompts, patch: UtilityPrompts): UtilityPrompts {
  return {
    impersonationPrompt: patch.impersonationPrompt ?? base.impersonationPrompt,
    worldInfoFormat: patch.worldInfoFormat ?? base.worldInfoFormat,
    scenarioFormat: patch.scenarioFormat ?? base.scenarioFormat,
    personalityFormat: patch.personalityFormat ?? base.personalityFormat,
    groupNudgePrompt: patch.groupNudgePrompt ?? base.groupNudgePrompt,
    newChatPrompt: patch.newChatPrompt ?? base.newChatPrompt,
    newGroupChatPrompt: patch.newGroupChatPrompt ?? base.newGroupChatPrompt,
    newExampleChatPrompt: patch.newExampleChatPrompt ?? base.newExampleChatPrompt,
    continueNudgePrompt: patch.continueNudgePrompt ?? base.continueNudgePrompt,
    sendIfEmpty: patch.sendIfEmpty ?? base.sendIfEmpty,
    seed: patch.seed ?? base.seed,
  };
}

/**
 * 从 other（原酒馆 settings 对象的剩余字段）中提取 “Utility Prompts / Format Templates” 等字段，放到 PresetInfo.utilityPrompts。
 * 注意：这里只做“读取视图”，不会修改原 other。
 */
function extractUtilityPrompts(other: any): UtilityPrompts {
  const s = (keys: string[]) => readString(getFirstDefined(other, keys));
  const n = (keys: string[]) => readNumber(getFirstDefined(other, keys));

  return {
    impersonationPrompt: s(['impersonation_prompt', 'impersonationPrompt']),
    worldInfoFormat: s(['wi_format', 'wiFormat', 'worldInfoFormat']),
    scenarioFormat: s(['scenario_format', 'scenarioFormat']),
    personalityFormat: s(['personality_format', 'personalityFormat']),
    groupNudgePrompt: s(['group_nudge_prompt', 'groupNudgePrompt']),
    newChatPrompt: s(['new_chat_prompt', 'newChatPrompt']),
    newGroupChatPrompt: s(['new_group_chat_prompt', 'newGroupChatPrompt']),
    newExampleChatPrompt: s(['new_example_chat_prompt', 'newExampleChatPrompt']),
    continueNudgePrompt: s(['continue_nudge_prompt', 'continueNudgePrompt']),
    sendIfEmpty: s(['send_if_empty', 'sendIfEmpty']),
    seed: n(['seed']),
  };
}

/**
 * 辅助：获取预设管理器
 */
function getPresetManager() {
  const ctx = window.SillyTavern.getContext();
  const manager = ctx.getPresetManager(CHAT_API_TYPE);
  if (!manager) throw new Error('Preset manager not found');
  return manager;
}

/**
 * 辅助：将原始设置转换为合并后的简化结构
 */
function transformPreset(name: string, settings: any): PresetInfo {
  const { prompts: rawPrompts = [], prompt_order: rawOrder = [], ...other } = settings || {};
  
  let activeOrderList: any[] = [];
  if (Array.isArray(rawOrder) && rawOrder[0] && Array.isArray(rawOrder[0].order)) {
    activeOrderList = rawOrder[0].order;
  }

  const orderMap = new Map();
  activeOrderList.forEach((item: any, idx: number) => {
    if (item && item.identifier) {
      orderMap.set(String(item.identifier), {
        enabled: item.enabled,
        index: idx
      });
    }
  });

  const mergedPrompts = (rawPrompts as any[]).map(p => {
    const orderItem = orderMap.get(String(p.identifier));
    
    const { 
      injection_depth, 
      injection_order, 
      injection_trigger, 
      injection_position,
      system_prompt, 
      ...rest 
    } = p;

    const result: any = {
      ...rest,
      enabled: orderItem ? orderItem.enabled : p.enabled,
      depth: injection_depth ?? 0,
      order: injection_order ?? 100,
      trigger: injection_trigger ?? [],
      position: injection_position === 1 ? 'fixed' : 'relative'
    };

    if (orderItem !== undefined) {
      result.index = orderItem.index;
    }

    return result;
  });

  mergedPrompts.sort((a, b) => {
    const aIdx = a.index !== undefined ? a.index : Infinity;
    const bIdx = b.index !== undefined ? b.index : Infinity;
    return aIdx - bIdx;
  });

  const otherOut: any = other || {};
  const regexScripts = readPresetRegexScripts(otherOut);
  const utilityPrompts = extractUtilityPrompts(otherOut);
  // 输出侧：这些字段已迁移到 utilityPrompts，因此从 other 删除，避免重复与混淆
  stripUtilityPromptFields(otherOut);

  return {
    name: name || 'Default',
    prompts: mergedPrompts,
    utilityPrompts,
    regexScripts,
    other: otherOut
  };
}

function safeObject(x: any): Record<string, any> {
  return x && typeof x === 'object' && !Array.isArray(x) ? x : {};
}

/**
 * 从 other.extensions.regex_scripts 中提取正则脚本（不改动 other）。
 */
function readPresetRegexScripts(other: any): RegexScriptData[] {
  const ext = safeObject(other?.extensions);
  const raw = (ext as any).regex_scripts ?? (ext as any).regexScripts ?? [];
  return (Array.isArray(raw) ? raw : [])
    .filter(Boolean)
    .map((x: any) => fromStRegex(x));
}

/**
 * 辅助：将简化结构还原为酒馆原始结构
 */
function revertPreset(preset: PresetInfo): any {
  const loadedPrompts = preset.prompts
    .filter(p => p.index !== undefined)
    .sort((a, b) => (a.index as number) - (b.index as number));

  const rawOrder = loadedPrompts.map(p => ({
    identifier: p.identifier,
    enabled: p.enabled ?? true
  }));

  const rawPrompts: any[] = preset.prompts.map(p => {
    const { index, depth, order, trigger, position, enabled, ...rest } = p;
    
    return {
      ...rest,
      enabled: enabled ?? true,
      injection_depth: depth ?? 0,
      injection_order: order ?? 100,
      injection_trigger: trigger ?? [],
      injection_position: position === 'fixed' ? 1 : 0
    };
  });

  const prompt_order = [{
    character_id: 100000,
    order: rawOrder
  }];

  const out: any = {
    ...(preset as any).other,
    prompts: rawPrompts,
    prompt_order: prompt_order
  };

  // 写回 Utility Prompts（这些字段在 wrapper 输出里已从 other（旧名 apiSetting）移除）
  const up: any = (preset as any).utilityPrompts ?? {};
  if (up.impersonationPrompt !== undefined) out.impersonation_prompt = up.impersonationPrompt;
  if (up.worldInfoFormat !== undefined) out.wi_format = up.worldInfoFormat;
  if (up.scenarioFormat !== undefined) out.scenario_format = up.scenarioFormat;
  if (up.personalityFormat !== undefined) out.personality_format = up.personalityFormat;
  if (up.groupNudgePrompt !== undefined) out.group_nudge_prompt = up.groupNudgePrompt;
  if (up.newChatPrompt !== undefined) out.new_chat_prompt = up.newChatPrompt;
  if (up.newGroupChatPrompt !== undefined) out.new_group_chat_prompt = up.newGroupChatPrompt;
  if (up.newExampleChatPrompt !== undefined) out.new_example_chat_prompt = up.newExampleChatPrompt;
  if (up.continueNudgePrompt !== undefined) out.continue_nudge_prompt = up.continueNudgePrompt;
  if (up.sendIfEmpty !== undefined) out.send_if_empty = up.sendIfEmpty;
  if (up.seed !== undefined) out.seed = up.seed;

  // write preset regex scripts back to other.extensions.regex_scripts
  const ext = safeObject(out.extensions);
  const had = Object.prototype.hasOwnProperty.call(ext, 'regex_scripts');
  if ((Array.isArray(preset.regexScripts) && preset.regexScripts.length > 0) || had) {
    ext.regex_scripts = (Array.isArray(preset.regexScripts) ? preset.regexScripts : []).map((x) => toStRegex(x));
    out.extensions = ext;
  }

  return out;
}

/**
 * 获取特定预设的原始 settings
 */
function getRawSettings(name: string): any | null {
  const ctx = window.SillyTavern.getContext();
  const presetManager = ctx.getPresetManager(CHAT_API_TYPE);
  if (!presetManager) return null;

  const activePresetName = (presetManager as any).getSelectedPresetName();
  if (name === activePresetName) {
    return ctx.chatCompletionSettings;
  }

  const { presets, preset_names } = (presetManager as any).getPresetList();
  if (Array.isArray(preset_names)) {
    const idx = preset_names.indexOf(name);
    return idx !== -1 ? presets[idx] : null;
  } else if (preset_names && typeof preset_names === 'object') {
    const idx = (preset_names as any)[name];
    return idx !== undefined ? presets[idx] : null;
  }
  return null;
}

/**
 * 获取所有预设的详细信息
 */
function getAllPresetsDetail(): PresetInfo[] {
  const ctx = window.SillyTavern.getContext();
  const presetManager = getPresetManager();

  const { presets, preset_names } = (presetManager as any).getPresetList();
  const activePresetName = (presetManager as any).getSelectedPresetName();
  const results: PresetInfo[] = [];

  const process = (pName: string, pSettings: any) => {
    const isActive = pName === activePresetName;
    const finalSettings = isActive ? (ctx.chatCompletionSettings || pSettings || {}) : (pSettings || {});
    results.push(transformPreset(pName, finalSettings));
  };

  if (Array.isArray(preset_names)) {
    preset_names.forEach((pName: string, index: number) => process(pName, presets[index]));
  } else if (preset_names && typeof preset_names === 'object') {
    Object.entries(preset_names).forEach(([pName, index]) => process(pName, presets[index as number]));
  }

  return results;
}

/**
 * 获取聊天预设（单个）
 */
export function get(input?: GetPresetInput): GetPresetOutput {
  const presetManager = getPresetManager();

  const name = input?.name || (presetManager as any).getSelectedPresetName();
  const raw = getRawSettings(name);
  
  if (raw) {
    return { preset: transformPreset(name, raw) };
  }
  return { preset: null };
}

/**
 * 列出预设（返回全量详情 + 当前激活名称）
 */
export function list(): ListPresetsOutput {
  const presetManager = getPresetManager();
  const active = (presetManager as any).getSelectedPresetName() || '';
  return { presets: getAllPresetsDetail(), active };
}

/**
 * 创建新预设
 */
export async function create(input: CreatePresetInput): Promise<CreatePresetOutput> {
  const presetManager = getPresetManager();
  const templateName = (presetManager as any).getSelectedPresetName();
  const templateRaw = templateName ? getRawSettings(templateName) : {};
  const basePreset = transformPreset(input.name, JSON.parse(JSON.stringify(templateRaw)));

  if (Object.prototype.hasOwnProperty.call(input as any, 'apiSetting')) {
    throw new Error('[ST API] preset.create: "apiSetting" has been renamed to "other". Please use "other".');
  }

  if ((input as any).other) {
    assertNoUtilityPromptFieldsInOther((input as any).other, 'preset.create(other)');
    basePreset.other = { ...basePreset.other, ...(input as any).other };
  }

  if ((input as any).utilityPrompts) {
    basePreset.utilityPrompts = mergeUtilityPrompts(basePreset.utilityPrompts, (input as any).utilityPrompts);
  }
  if (input.prompts) {
    basePreset.prompts = input.prompts as PromptInfo[];
  }
  if (Array.isArray(input.regexScripts)) {
    basePreset.regexScripts = input.regexScripts;
  } else {
    // 兼容：如果用户把 regex_scripts 塞在 other.extensions 里，这里会从 other 直接提取
    basePreset.regexScripts = readPresetRegexScripts(basePreset.other);
  }

  const rawToSave = revertPreset(basePreset);
  await (presetManager as any).savePreset(input.name, rawToSave);

  return { success: true, name: input.name };
}

/**
 * 更新预设
 */
export async function update(input: UpdatePresetInput): Promise<UpdatePresetOutput> {
  const presetManager = getPresetManager();
  const raw = getRawSettings(input.name);
  if (!raw) throw new Error(`Preset not found: ${input.name}`);

  const preset = transformPreset(input.name, JSON.parse(JSON.stringify(raw)));

  if (Object.prototype.hasOwnProperty.call(input as any, 'apiSetting')) {
    throw new Error('[ST API] preset.update: "apiSetting" has been renamed to "other". Please use "other".');
  }

  if ((input as any).other) {
    assertNoUtilityPromptFieldsInOther((input as any).other, 'preset.update(other)');
    preset.other = { ...preset.other, ...(input as any).other };
  }

  if ((input as any).utilityPrompts) {
    preset.utilityPrompts = mergeUtilityPrompts(preset.utilityPrompts, (input as any).utilityPrompts);
  }
  if (input.prompts) {
    preset.prompts = input.prompts as PromptInfo[];
  }
  if (Array.isArray(input.regexScripts)) {
    preset.regexScripts = input.regexScripts;
  } else {
    preset.regexScripts = readPresetRegexScripts(preset.other);
  }

  const rawToSave = revertPreset(preset);
  const targetName = input.newName || input.name;

  await (presetManager as any).savePreset(targetName, rawToSave);

  if (input.newName && input.newName !== input.name) {
    await (presetManager as any).deletePreset(input.name);
  }

  return { success: true };
}

/**
 * 删除预设
 */
export async function deletePreset(input: DeletePresetInput): Promise<DeletePresetOutput> {
  const presetManager = getPresetManager();
  await (presetManager as any).deletePreset(input.name);
  return { success: true };
}

// --- Prompt 条目操作接口 ---

/**
 * 获取特定 Prompt 条目
 */
export function getPrompt(input: GetPromptInput): GetPromptOutput {
  const presetManager = getPresetManager();
  const targetName = input.presetName || (presetManager as any).getSelectedPresetName();
  
  const raw = getRawSettings(targetName);
  if (!raw) throw new Error(`Preset not found: ${targetName}`);
  const preset = transformPreset(targetName, raw);
  const prompt = preset.prompts.find(p => p.identifier === input.identifier);
  if (!prompt) throw new Error(`Prompt not found: ${input.identifier}`);
  return { prompt };
}

/**
 * 创建新 Prompt 条目并存入预设
 */
export async function createPrompt(input: CreatePromptInput): Promise<CreatePromptOutput> {
  const presetManager = getPresetManager();
  const targetName = input.presetName || (presetManager as any).getSelectedPresetName();

  const raw = getRawSettings(targetName);
  if (!raw) throw new Error(`Preset not found: ${targetName}`);
  const preset = transformPreset(targetName, JSON.parse(JSON.stringify(raw)));

  const newPrompt: PromptInfo = {
    identifier: input.prompt.identifier || (window as any).uuidv4?.() || crypto.randomUUID(),
    name: input.prompt.name || 'New Prompt',
    enabled: input.prompt.enabled ?? true,
    role: input.prompt.role || 'system',
    content: input.prompt.content || '',
    depth: input.prompt.depth ?? 0,
    order: input.prompt.order ?? 100,
    trigger: input.prompt.trigger ?? [],
    position: input.prompt.position || 'relative',
    ...input.prompt
  };

  preset.prompts.push(newPrompt);
  
  const rawToSave = revertPreset(preset);
  await (presetManager as any).savePreset(targetName, rawToSave);

  return { success: true, prompt: newPrompt };
}

/**
 * 更新预设中的特定 Prompt 条目
 */
export async function updatePrompt(input: UpdatePromptInput): Promise<UpdatePromptOutput> {
  const presetManager = getPresetManager();
  const targetName = input.presetName || (presetManager as any).getSelectedPresetName();

  const raw = getRawSettings(targetName);
  if (!raw) throw new Error(`Preset not found: ${targetName}`);
  const preset = transformPreset(targetName, JSON.parse(JSON.stringify(raw)));

  const index = preset.prompts.findIndex(p => p.identifier === input.identifier);
  if (index === -1) throw new Error(`Prompt not found: ${input.identifier}`);

  preset.prompts[index] = {
    ...preset.prompts[index],
    ...input.update
  };

  const rawToSave = revertPreset(preset);
  await (presetManager as any).savePreset(targetName, rawToSave);

  return { success: true, prompt: preset.prompts[index] };
}

/**
 * 从预设中删除特定 Prompt 条目
 */
export async function deletePrompt(input: DeletePromptInput): Promise<DeletePromptOutput> {
  const presetManager = getPresetManager();
  const targetName = input.presetName || (presetManager as any).getSelectedPresetName();

  const raw = getRawSettings(targetName);
  if (!raw) throw new Error(`Preset not found: ${targetName}`);
  const preset = transformPreset(targetName, JSON.parse(JSON.stringify(raw)));

  const initialCount = preset.prompts.length;
  preset.prompts = preset.prompts.filter(p => p.identifier !== input.identifier);

  if (preset.prompts.length === initialCount) {
    throw new Error(`Prompt not found: ${input.identifier}`);
  }

  const rawToSave = revertPreset(preset);
  await (presetManager as any).savePreset(targetName, rawToSave);

  return { success: true };
}
