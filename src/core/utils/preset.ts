import type { PresetInfo, PromptInfo } from '../../apis/preset/types';

export function detectPromptOrderCharacterId(settings: any, fallback = 100001): number {
  const v = settings?.prompt_order?.[0]?.character_id;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return fallback;
}

function normalizeEnabled(value: any, fallback = true): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

/**
 * 将 wrapper 的 PresetInfo 还原为酒馆内部的 raw preset/settings 结构（prompts + prompt_order）。
 * 注意：character_id 需要与酒馆当前 PromptManager 的 dummyId 对齐；默认从当前 settings 推断。
 */
export function presetInfoToStSettings(preset: PresetInfo, options: { promptOrderCharacterId?: number } = {}) {
  const promptOrderCharacterId = options.promptOrderCharacterId ?? 100001;

  const loadedPrompts = (preset.prompts || [])
    .filter((p) => p && p.index !== undefined)
    .sort((a, b) => Number(a.index) - Number(b.index));

  const rawOrder = loadedPrompts.map((p) => ({
    identifier: p.identifier,
    enabled: normalizeEnabled(p.enabled, true),
  }));

  const rawPrompts: any[] = (preset.prompts || []).map((p: PromptInfo) => {
    const { index, depth, order, trigger, position, enabled, ...rest } = p as any;
    return {
      ...rest,
      enabled: normalizeEnabled(enabled, true),
      injection_depth: depth ?? 0,
      injection_order: order ?? 100,
      injection_trigger: trigger ?? [],
      injection_position: position === 'fixed' ? 1 : 0,
    };
  });

  const prompt_order = [
    {
      character_id: promptOrderCharacterId,
      order: rawOrder,
    },
  ];

  return {
    ...(preset.apiSetting || {}),
    prompts: rawPrompts,
    prompt_order,
  };
}

/**
 * 将 preset 应用到酒馆当前 chatCompletionSettings（只修改 prompts/prompt_order/apiSetting）。
 * 返回一个 restore() 用于回滚。
 */
export function applyPresetToChatCompletionSettings(
  settings: any,
  preset: PresetInfo,
  options: { promptOrderCharacterId?: number } = {},
) {
  const snapshot = {
    prompts: settings?.prompts,
    prompt_order: settings?.prompt_order,
    apiSetting: new Map<string, { hadOwn: boolean; value: any }>(),
  };

  const promptOrderCharacterId =
    options.promptOrderCharacterId ?? detectPromptOrderCharacterId(settings, 100001);

  const st = presetInfoToStSettings(preset, { promptOrderCharacterId });

  // apply: prompts + order + apiSetting (shallow merge for apiSetting keys)
  settings.prompts = st.prompts;
  settings.prompt_order = st.prompt_order;

  // apiSetting 合并（避免覆盖 prompts/prompt_order）
  Object.keys(preset.apiSetting || {}).forEach((k) => {
    if (k === 'prompts' || k === 'prompt_order') return;
    snapshot.apiSetting.set(k, { hadOwn: Object.prototype.hasOwnProperty.call(settings, k), value: settings[k] });
    settings[k] = (preset.apiSetting as any)[k];
  });

  const restore = () => {
    settings.prompts = snapshot.prompts;
    settings.prompt_order = snapshot.prompt_order;
    for (const [k, prev] of snapshot.apiSetting.entries()) {
      if (!prev.hadOwn) {
        delete settings[k];
      } else {
        settings[k] = prev.value;
      }
    }
  };

  return { restore, promptOrderCharacterId };
}

