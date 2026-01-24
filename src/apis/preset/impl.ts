import type {
  GetPresetInput,
  GetPresetOutput,
  ListPresetsOutput,
  PresetInfo,
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
  const { prompts: rawPrompts = [], prompt_order: rawOrder = [], ...apiSetting } = settings || {};
  
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

  const apiSettingOut: any = apiSetting || {};
  const regexScripts = readPresetRegexScripts(apiSettingOut);

  return {
    name: name || 'Default',
    prompts: mergedPrompts,
    regexScripts,
    apiSetting: apiSettingOut
  };
}

function safeObject(x: any): Record<string, any> {
  return x && typeof x === 'object' && !Array.isArray(x) ? x : {};
}

/**
 * 从 apiSetting.extensions.regex_scripts 中提取正则脚本（不改动 apiSetting）。
 */
function readPresetRegexScripts(apiSetting: any): RegexScriptData[] {
  const ext = safeObject(apiSetting?.extensions);
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
    ...preset.apiSetting,
    prompts: rawPrompts,
    prompt_order: prompt_order
  };

  // write preset regex scripts back to apiSetting.extensions.regex_scripts
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

  if (input.apiSetting) {
    basePreset.apiSetting = { ...basePreset.apiSetting, ...input.apiSetting };
  }
  if (input.prompts) {
    basePreset.prompts = input.prompts as PromptInfo[];
  }
  if (Array.isArray(input.regexScripts)) {
    basePreset.regexScripts = input.regexScripts;
  } else {
    // 兼容：如果用户把 regex_scripts 塞在 apiSetting.extensions 里，这里会从 apiSetting 直接提取
    basePreset.regexScripts = readPresetRegexScripts(basePreset.apiSetting);
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

  if (input.apiSetting) {
    preset.apiSetting = { ...preset.apiSetting, ...input.apiSetting };
  }
  if (input.prompts) {
    preset.prompts = input.prompts as PromptInfo[];
  }
  if (Array.isArray(input.regexScripts)) {
    preset.regexScripts = input.regexScripts;
  } else {
    preset.regexScripts = readPresetRegexScripts(preset.apiSetting);
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
