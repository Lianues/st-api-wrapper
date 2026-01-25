import type { PresetInfo, PromptInfo } from '../../apis/preset/types';

export function detectPromptOrderCharacterId(settings: any, fallback = 100001): number {
  const list = Array.isArray(settings?.prompt_order) ? settings.prompt_order : [];

  // Prefer the configured dummy/global character id if it exists in list.
  const hasFallback = list.some((x: any) => String(x?.character_id) === String(fallback));
  if (hasFallback) return fallback;

  const v = list?.[0]?.character_id;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return fallback;
}

function normalizeEnabled(value: any, fallback = true): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
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

function assertNoUtilityPromptFieldsInOther(preset: PresetInfo) {
  const other: any = (preset as any)?.other;
  if (!other || typeof other !== 'object' || Array.isArray(other)) return;
  const found = UTILITY_PROMPT_KEYS.find((k) => Object.prototype.hasOwnProperty.call(other, k));
  if (!found) return;
  throw new Error(`[ST API] PresetInfo.other contains utility prompt field "${String(found)}". Please move it to PresetInfo.utilityPrompts.`);
}

function utilityPromptsToApiSetting(preset: PresetInfo): Record<string, any> {
  const up: any = (preset as any)?.utilityPrompts;
  if (!up || typeof up !== 'object') return {};

  const out: Record<string, any> = {};
  const set = (k: string, v: any) => {
    if (v === undefined) return;
    out[k] = v;
  };

  set('impersonation_prompt', up.impersonationPrompt);
  set('wi_format', up.worldInfoFormat);
  set('scenario_format', up.scenarioFormat);
  set('personality_format', up.personalityFormat);
  set('group_nudge_prompt', up.groupNudgePrompt);
  set('new_chat_prompt', up.newChatPrompt);
  set('new_group_chat_prompt', up.newGroupChatPrompt);
  set('new_example_chat_prompt', up.newExampleChatPrompt);
  set('continue_nudge_prompt', up.continueNudgePrompt);
  set('send_if_empty', up.sendIfEmpty);
  set('seed', up.seed);

  return out;
}

/**
 * 将 wrapper 的 PresetInfo 还原为酒馆内部的 raw preset/settings 结构（prompts + prompt_order）。
 * 注意：character_id 需要与酒馆当前 PromptManager 的 dummyId 对齐；默认从当前 settings 推断。
 */
export function presetInfoToStSettings(preset: PresetInfo, options: { promptOrderCharacterId?: number } = {}) {
  if (Object.prototype.hasOwnProperty.call(preset as any, 'apiSetting')) {
    throw new Error('[ST API] PresetInfo.apiSetting has been renamed to PresetInfo.other. Please update your code.');
  }
  assertNoUtilityPromptFieldsInOther(preset);

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
    ...(((preset as any).other) || {}),
    ...utilityPromptsToApiSetting(preset),
    prompts: rawPrompts,
    prompt_order,
  };
}

/**
 * 将 preset 应用到酒馆当前 chatCompletionSettings（只修改 prompts/prompt_order/other）。
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

  // apply: prompts + order + other (shallow merge for other keys)
  settings.prompts = st.prompts;
  settings.prompt_order = st.prompt_order;

  // other 合并（避免覆盖 prompts/prompt_order）
  const mergedApiSetting = { ...(((preset as any).other) || {}), ...utilityPromptsToApiSetting(preset) };
  Object.keys(mergedApiSetting).forEach((k) => {
    if (k === 'prompts' || k === 'prompt_order') return;
    snapshot.apiSetting.set(k, { hadOwn: Object.prototype.hasOwnProperty.call(settings, k), value: settings[k] });
    settings[k] = (mergedApiSetting as any)[k];
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

/**
 * 将 preset 作为 patch 合并到酒馆当前 chatCompletionSettings（只修改 prompts/prompt_order/other）。
 * 合并规则（尽量贴近直觉）：
 * - prompts：按 identifier 覆盖/新增（shallow merge）
 * - prompt_order：保持原顺序为主；patch 中缺失的 identifier 追加；enabled 冲突时以 patch 为准
 * - other：浅合并（排除 prompts/prompt_order）
 *
 * 返回一个 restore() 用于回滚。
 */
export function applyPresetPatchToChatCompletionSettings(
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

  // --- merge prompts by identifier ---
  const basePrompts: any[] = Array.isArray(settings?.prompts) ? settings.prompts : [];
  const mergedPrompts: any[] = basePrompts.map((p) => ({ ...(p as any) }));
  const idxById = new Map<string, number>();

  mergedPrompts.forEach((p, idx) => {
    const id = p?.identifier;
    if (typeof id === 'string' && id) idxById.set(id, idx);
  });

  (st.prompts || []).forEach((p: any) => {
    const id = p?.identifier;
    if (typeof id !== 'string' || !id) return;
    if (idxById.has(id)) {
      const i = idxById.get(id)!;
      mergedPrompts[i] = { ...(mergedPrompts[i] ?? {}), ...p };
    } else {
      idxById.set(id, mergedPrompts.length);
      mergedPrompts.push({ ...p });
    }
  });

  settings.prompts = mergedPrompts;

  // --- merge prompt_order (keep base order) ---
  const basePromptOrderArr: any[] = Array.isArray(snapshot.prompt_order) ? snapshot.prompt_order : [];
  const baseOrderObj = basePromptOrderArr.find((x) => Number(x?.character_id) === Number(promptOrderCharacterId)) ?? basePromptOrderArr[0];
  const baseOrder: Array<{ identifier: string; enabled: boolean }> = Array.isArray(baseOrderObj?.order)
    ? baseOrderObj.order
        .filter((x: any) => x && typeof x.identifier === 'string' && x.identifier)
        .map((x: any) => ({ identifier: String(x.identifier), enabled: normalizeEnabled(x.enabled, true) }))
    : [];

  const patchOrderObj = Array.isArray(st.prompt_order) ? st.prompt_order[0] : null;
  const patchOrder: Array<{ identifier: string; enabled: boolean }> = Array.isArray(patchOrderObj?.order)
    ? patchOrderObj.order
        .filter((x: any) => x && typeof x.identifier === 'string' && x.identifier)
        .map((x: any) => ({ identifier: String(x.identifier), enabled: normalizeEnabled(x.enabled, true) }))
    : [];

  const mergedOrder: Array<{ identifier: string; enabled: boolean }> = baseOrder.map((x) => ({ ...x }));
  const orderIdx = new Map<string, number>();
  mergedOrder.forEach((x, i) => orderIdx.set(x.identifier, i));

  // apply patch enabled + append missing ids
  patchOrder.forEach((x) => {
    if (orderIdx.has(x.identifier)) {
      mergedOrder[orderIdx.get(x.identifier)!].enabled = x.enabled;
    } else {
      orderIdx.set(x.identifier, mergedOrder.length);
      mergedOrder.push({ ...x });
    }
  });

  // ensure new prompts introduced by patch are present in order list
  (st.prompts || []).forEach((p: any) => {
    const id = p?.identifier;
    if (typeof id !== 'string' || !id) return;
    if (orderIdx.has(id)) return;
    orderIdx.set(id, mergedOrder.length);
    mergedOrder.push({ identifier: id, enabled: normalizeEnabled(p?.enabled, true) });
  });

  settings.prompt_order = [
    {
      character_id: promptOrderCharacterId,
      order: mergedOrder,
    },
  ];

  // other 合并（避免覆盖 prompts/prompt_order）
  const mergedApiSetting = { ...(((preset as any).other) || {}), ...utilityPromptsToApiSetting(preset) };
  Object.keys(mergedApiSetting).forEach((k) => {
    if (k === 'prompts' || k === 'prompt_order') return;
    snapshot.apiSetting.set(k, { hadOwn: Object.prototype.hasOwnProperty.call(settings, k), value: settings[k] });
    settings[k] = (mergedApiSetting as any)[k];
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

