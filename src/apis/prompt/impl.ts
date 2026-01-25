import type {
  BuildRequestInput,
  BuildRequestOutput,
  ChatCompletionMessage,
  ExtraMessageBlock,
  GenerateInput,
  GenerateOutput,
  GetPromptInput,
  GetPromptOutput,
} from './types';
import { normalizeChatMessages } from '../../core/utils/messages';
import { chatMessagesToStChat } from '../../core/utils/chat';
import { applyPresetPatchToChatCompletionSettings, applyPresetToChatCompletionSettings, detectPromptOrderCharacterId } from '../../core/utils/preset';
import { worldBookToStWorldInfo } from '../../core/utils/worldbook';

function replaceArrayContents<T>(arr: T[], next: T[]) {
  arr.length = 0;
  arr.push(...next);
}

async function applyChatHistoryInjections(baseChat: any[], injections: any[]) {
  if (!Array.isArray(injections) || injections.length === 0) return baseChat;
  const base = Array.isArray(baseChat) ? baseChat : [];
  const n = base.length;

  // buckets by gap (0..n), where gap=n is after last base message
  const buckets: Array<Array<{ order: number; idx: number; raw: any }>> = Array.from({ length: n + 1 }, () => []);

  const converted = await chatMessagesToStChat(injections.map((x: any) => x?.message).filter((x: any) => x));

  let convIdx = 0;
  injections.forEach((inj: any, idx: number) => {
    if (!inj?.message) return;
    const raw = converted[convIdx++];
    if (!raw) return;

    const depth = typeof inj.depth === 'number' && Number.isFinite(inj.depth) ? Math.max(0, Math.trunc(inj.depth)) : 0;
    const gap = Math.max(0, Math.min(n, n - depth));
    const order = typeof inj.order === 'number' && Number.isFinite(inj.order) ? inj.order : 100;

    buckets[gap].push({ order, idx, raw });
  });

  for (const b of buckets) {
    b.sort((a, b) => (a.order - b.order) || (a.idx - b.idx));
  }

  const out: any[] = [];
  out.push(...buckets[0].map((x) => x.raw));
  for (let i = 0; i < n; i++) {
    out.push(base[i]);
    out.push(...buckets[i + 1].map((x) => x.raw));
  }
  return out;
}

function insertExtraBlocks(messages: ChatCompletionMessage[], blocks: ExtraMessageBlock[]): ChatCompletionMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return blocks.map((b) => ({ role: b.role, content: b.content, ...(b.name ? { name: b.name } : {}) }));
  }
  if (!Array.isArray(blocks) || blocks.length === 0) return messages;

  const result: ChatCompletionMessage[] = messages.map((m) => ({ ...m }));

  const insertOne = (msg: ChatCompletionMessage, insert: string | undefined) => {
    switch (insert) {
      case 'head': {
        result.unshift(msg);
        return;
      }
      case 'afterSystem': {
        let lastSystem = -1;
        for (let i = 0; i < result.length; i++) {
          if (result[i]?.role === 'system') lastSystem = i;
        }
        const idx = lastSystem >= 0 ? lastSystem + 1 : 0;
        result.splice(idx, 0, msg);
        return;
      }
      case 'beforeLastUser': {
        const idx = result.map((m) => m?.role).lastIndexOf('user');
        result.splice(idx >= 0 ? idx : 0, 0, msg);
        return;
      }
      case 'beforeLastAssistant': {
        const idx = result.map((m) => m?.role).lastIndexOf('assistant');
        result.splice(idx >= 0 ? idx : result.length, 0, msg);
        return;
      }
      case 'tail':
      default: {
        result.push(msg);
        return;
      }
    }
  };

  for (const b of blocks) {
    if (!b) continue;
    const msg: ChatCompletionMessage = {
      role: String(b.role || ''),
      content: String(b.content ?? ''),
      ...(b.name ? { name: b.name } : {}),
    };

    // New: gap index insertion (0 = after last message)
    if (typeof b.index === 'number' && Number.isFinite(b.index)) {
      const gapIndex = Math.max(0, Math.trunc(b.index));
      const clamped = Math.min(gapIndex, result.length);
      const insertAt = result.length - clamped;
      result.splice(insertAt, 0, msg);
      continue;
    }

    // Fallback: legacy semantic insertion
    insertOne(msg, b.insert);
  }

  return result;
}

function makeTempWorldInfoName() {
  return `__st_api_tmp_wi__${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeWorldInfoEntriesMap(raw: any): Record<number, any> {
  const out: Record<number, any> = {};
  if (!raw || typeof raw !== 'object') return out;

  for (const [k, v] of Object.entries(raw)) {
    const keyUid = Number(k);
    if (!Number.isFinite(keyUid)) continue;

    const entry = v && typeof v === 'object' ? { ...(v as any) } : { uid: keyUid };
    const uid = Number((entry as any).uid);
    const finalUid = Number.isFinite(uid) ? uid : keyUid;
    entry.uid = finalUid;
    out[finalUid] = entry;
  }

  return out;
}

/**
 * 合并两份 world info entries-map：按 comment（条目名）匹配，同名则覆盖，uid 保持 base 的 uid。
 * 不同名则分配新 uid（避免冲突）。
 */
function mergeWorldInfoEntriesByComment(baseRaw: any, injectedRaw: any): Record<number, any> {
  const base = normalizeWorldInfoEntriesMap(baseRaw);
  const injected = normalizeWorldInfoEntriesMap(injectedRaw);

  const merged: Record<number, any> = { ...base };
  const nameToUid = new Map<string, number>();
  const usedUids = new Set<number>();
  let maxUid = -1;

  for (const [uidStr, entry] of Object.entries(merged)) {
    const uid = Number(uidStr);
    if (!Number.isFinite(uid)) continue;
    usedUids.add(uid);
    maxUid = Math.max(maxUid, uid);
    const name = String((entry as any)?.comment ?? '').trim();
    if (name && !nameToUid.has(name)) nameToUid.set(name, uid);
  }

  const injectedEntries = Object.values(injected) as any[];
  for (const e of injectedEntries) {
    const name = String(e?.comment ?? '').trim();

    if (name && nameToUid.has(name)) {
      const targetUid = nameToUid.get(name)!;
      merged[targetUid] = { ...(merged[targetUid] ?? {}), ...e, uid: targetUid, comment: name };
      continue;
    }

    let newUid = Number(e?.uid);
    if (!Number.isFinite(newUid) || usedUids.has(newUid)) {
      newUid = maxUid + 1;
      while (usedUids.has(newUid)) newUid++;
    }

    maxUid = Math.max(maxUid, newUid);
    usedUids.add(newUid);
    merged[newUid] = { ...e, uid: newUid, ...(name ? { comment: name } : {}) };
    if (name && !nameToUid.has(name)) nameToUid.set(name, newUid);
  }

  return merged;
}

async function applyWorldbookOverrides(ctx: any, wbOpt: any, restorers: Array<() => void>): Promise<boolean> {
  const mode = String(wbOpt?.mode ?? 'current');
  if (mode === 'disable') return true;

  const injectBook = wbOpt?.inject;
  const replaceBook = wbOpt?.replace;
  if (injectBook && replaceBook) {
    throw new Error('worldbook.inject and worldbook.replace are mutually exclusive');
  }

  if (!injectBook && !replaceBook) return false;
  if (!ctx?.chatMetadata) throw new Error('chatMetadata not available in context');

  // @ts-ignore - runtime-only module provided by SillyTavern
  const wi = await import('/scripts/world-info.js') as any;
  const worldInfoCache = wi?.worldInfoCache;
  const loadWorldInfo = wi?.loadWorldInfo;
  const selectedWorldInfo = wi?.selected_world_info;
  const metadataKey = String(wi?.METADATA_KEY || 'world_info');

  if (!worldInfoCache || typeof worldInfoCache.set !== 'function') {
    throw new Error('worldInfoCache is not available (failed to import /scripts/world-info.js)');
  }

  const chatMetadata = ctx.chatMetadata as any;
  const snapshot = chatMetadata[metadataKey];
  const tempName = makeTempWorldInfoName();

  let entries: Record<number, any> = {};

  if (replaceBook) {
    entries = worldBookToStWorldInfo(replaceBook).entries;
  } else if (injectBook) {
    const injectedEntries = worldBookToStWorldInfo(injectBook).entries;
    let baseEntries: any = {};

    // base: only merge current chat lorebook if it isn't already activated globally (to avoid duplicates)
    const currentName = snapshot;
    const selected = Array.isArray(selectedWorldInfo) ? selectedWorldInfo : [];
    if (typeof currentName === 'string' && currentName.trim() !== '' && !selected.includes(currentName)) {
      try {
        const data = typeof loadWorldInfo === 'function' ? await loadWorldInfo(currentName) : null;
        if (data && typeof data === 'object' && (data as any).entries && typeof (data as any).entries === 'object') {
          baseEntries = (data as any).entries;
        }
      } catch {
        // ignore base load errors; inject-only still works
      }
    }

    entries = mergeWorldInfoEntriesByComment(baseEntries, injectedEntries);
  }

  // write temp book into cache and point chat metadata to it
  worldInfoCache.set(tempName, { entries });
  chatMetadata[metadataKey] = tempName;

  restorers.push(() => {
    try {
      chatMetadata[metadataKey] = snapshot;
    } catch {
      // ignore
    }
    try {
      worldInfoCache.delete(tempName);
    } catch {
      // ignore
    }
  });

  return false;
}

/**
 * 获取当前提示词（最终发送给 API 的结果）
 */
export async function get(input: GetPromptInput): Promise<GetPromptOutput> {
  const ctx = window.SillyTavern.getContext();
  const { eventSource, event_types, generate, characterId } = ctx;

  const timeoutMs = input?.timeoutMs ?? 8000;
  const chid = input?.forceCharacterId ?? characterId;

  if (chid === undefined || chid === null) {
    throw new Error('No character selected (characterId is undefined).');
  }

  return await new Promise<GetPromptOutput>((resolve, reject) => {
    let done = false;

    const cleanup = () => {
      eventSource.removeListener(event_types.CHAT_COMPLETION_PROMPT_READY, onReady);
    };

    const finish = (err?: unknown, result?: GetPromptOutput) => {
      if (done) return;
      done = true;
      cleanup();
      if (err) reject(err);
      else resolve(result!);
    };

    const onReady = async (data: any) => {
      const chat = await normalizeChatMessages(data?.chat);

      finish(undefined, {
        chat,
        characterId: chid,
        timestamp: Date.now(),
      });
    };

    eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, onReady);

    const timer = setTimeout(() => {
      clearTimeout(timer);
      finish(new Error(`Timeout: did not receive CHAT_COMPLETION_PROMPT_READY within ${timeoutMs}ms.`));
    }, timeoutMs);

    try {
      Promise.resolve(generate('normal', { force_chid: chid }, true)).catch((e: unknown) => finish(e));
    } catch (e) {
      finish(e);
    }
  });
}

/**
 * 生成一次“请求体/请求所需内容”，支持预设/世界书/聊天记录注入与最大化自定义。
 */
export async function buildRequest(input: BuildRequestInput): Promise<BuildRequestOutput> {
  const ctx = window.SillyTavern.getContext();
  const { eventSource, event_types, generate, characterId, mainApi } = ctx;

  const timeoutMs = input?.timeoutMs ?? 8000;
  const chid = input?.forceCharacterId ?? characterId;

  if (chid === undefined || chid === null) {
    throw new Error('No character selected (characterId is undefined).');
  }

  const restorers: Array<() => void> = [];
  let skipWIAN = false;

  try {
    // --- preset overrides (chat completion only, but safe to apply regardless) ---
    const presetOpt = input?.preset;
    const presetMode = String(presetOpt?.mode ?? 'current');
    const presetInject = presetOpt?.inject;
    const presetReplace = presetOpt?.replace;

    if (presetMode === 'disable') {
      const settings = ctx.chatCompletionSettings;
      const snapshot = { prompt_order: settings?.prompt_order };
      const promptOrderCharacterId = detectPromptOrderCharacterId(settings, 100001);

      const identifiers = Array.isArray(settings?.prompts)
        ? settings.prompts.map((p: any) => p?.identifier).filter((x: any) => typeof x === 'string' && x)
        : [];

      settings.prompt_order = [
        {
          character_id: promptOrderCharacterId,
          order: identifiers.map((identifier: string) => ({ identifier, enabled: false })),
        },
      ];

      restorers.push(() => {
        settings.prompt_order = snapshot.prompt_order;
      });
    } else if (presetInject || presetReplace) {
      if (presetInject && presetReplace) {
        throw new Error('preset.inject and preset.replace are mutually exclusive');
      }
      if (presetReplace) {
        const applied = applyPresetToChatCompletionSettings(ctx.chatCompletionSettings, presetReplace);
        restorers.push(applied.restore);
      } else if (presetInject) {
        const applied = applyPresetPatchToChatCompletionSettings(ctx.chatCompletionSettings, presetInject);
        restorers.push(applied.restore);
      }
    }

    // --- worldbook overrides ---
    skipWIAN = await applyWorldbookOverrides(ctx, input?.worldbook, restorers);

    // --- chat history overrides ---
    // - chatHistory.replace: replace whole history for this build
    // - chatHistory.inject: inject blocks by depth/order for this build
    const chOpt = input?.chatHistory;
    const replaceMessages = chOpt?.replace;
    const injectBlocks = chOpt?.inject ?? [];

    const needsChatOverride = Array.isArray(replaceMessages) || (Array.isArray(injectBlocks) && injectBlocks.length > 0);
    if (needsChatOverride) {
      const chatArr = ctx.chat as any[];
      if (!Array.isArray(chatArr)) throw new Error('ctx.chat is not an array');
      const snapshot = chatArr.slice();

      let baseChat: any[] = snapshot;
      if (Array.isArray(replaceMessages)) {
        baseChat = await chatMessagesToStChat(replaceMessages);
      }

      const merged = await applyChatHistoryInjections(baseChat, injectBlocks);
      replaceArrayContents(chatArr, merged as any[]);
      restorers.push(() => replaceArrayContents(chatArr, snapshot));
    }

    return await new Promise<BuildRequestOutput>((resolve, reject) => {
      let done = false;
      let capturedChat: ChatCompletionMessage[] | undefined;
      let capturedTextPrompt: string | undefined;
      let capturedAfterData: any | undefined;

      const cleanup = () => {
        eventSource.removeListener(event_types.CHAT_COMPLETION_PROMPT_READY, onChatReady);
        eventSource.removeListener(event_types.GENERATE_AFTER_COMBINE_PROMPTS, onTextReady);
        eventSource.removeListener(event_types.GENERATE_AFTER_DATA, onAfterData);
      };

      const finish = (err?: unknown) => {
        if (done) return;
        done = true;
        cleanup();
        if (err) return reject(err);

        const api = String(mainApi ?? '');
        const out: BuildRequestOutput = {
          timestamp: Date.now(),
          characterId: chid,
        };

        if (Array.isArray(capturedChat)) {
          const withBlocks = Array.isArray(input?.extraBlocks) ? insertExtraBlocks(capturedChat, input.extraBlocks) : capturedChat;
          out.chatCompletionMessages = withBlocks;
        }
        if (typeof capturedTextPrompt === 'string') {
          out.textPrompt = capturedTextPrompt;
        }

        // default: return captured generate_data for non-openai, or if includeGenerateData is false
        if (!input?.includeGenerateData) {
          if (capturedAfterData !== undefined) {
            out.generateData = capturedAfterData;
          }
          return resolve(out);
        }

        // includeGenerateData=true: build more accurate payload when possible
        (async () => {
          try {
            if (api === 'openai' && Array.isArray(out.chatCompletionMessages)) {
              // @ts-ignore - runtime-only module provided by SillyTavern
              const [{ createGenerationParameters }] = await Promise.all([import('/scripts/openai.js') as any]);
              const model = typeof ctx.getChatCompletionModel === 'function'
                ? ctx.getChatCompletionModel(ctx.chatCompletionSettings)
                : undefined;
              if (!createGenerationParameters) throw new Error('Failed to import createGenerationParameters from /scripts/openai.js');
              if (!model) throw new Error('Failed to resolve chat completion model');
              const { generate_data } = await createGenerationParameters(ctx.chatCompletionSettings, model, 'normal', out.chatCompletionMessages, { jsonSchema: null });
              out.generateData = generate_data;
              return resolve(out);
            }

            // Text completions: GENERATE_AFTER_DATA already provides final payload
            if (capturedAfterData !== undefined) {
              out.generateData = capturedAfterData;
            }
            return resolve(out);
          } catch (e) {
            return reject(e);
          }
        })();
      };

      const onChatReady = (data: any) => {
        const chat = data?.chat;
        if (!Array.isArray(chat) || chat.length === 0) return;
        capturedChat = chat;
        if (String(mainApi ?? '') === 'openai') {
          finish();
        }
      };

      const onTextReady = (data: any) => {
        const prompt = data?.prompt;
        if (typeof prompt !== 'string' || prompt.trim() === '') return;
        capturedTextPrompt = prompt;
        if (String(mainApi ?? '') !== 'openai') {
          finish();
        }
      };

      const onAfterData = (generateData: any, dryRun: any) => {
        if (dryRun !== true) return;
        capturedAfterData = generateData;
      };

      eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, onChatReady);
      eventSource.on(event_types.GENERATE_AFTER_COMBINE_PROMPTS, onTextReady);
      eventSource.on(event_types.GENERATE_AFTER_DATA, onAfterData);

      const timer = setTimeout(() => {
        clearTimeout(timer);
        finish(new Error(`Timeout: did not receive prompt events within ${timeoutMs}ms.`));
      }, timeoutMs);

      try {
        Promise.resolve(generate('normal', { force_chid: chid, skipWIAN }, true)).catch((e: unknown) => finish(e));
      } catch (e) {
        finish(e);
      }
    });
  } finally {
    // always rollback in reverse order
    for (let i = restorers.length - 1; i >= 0; i--) {
      try {
        restorers[i]();
      } catch {
        // ignore rollback errors
      }
    }
  }
}

/**
 * 真正发起一次生成请求（可选写入聊天），并支持 token 流式回调。
 */
export async function generate(input: GenerateInput): Promise<GenerateOutput> {
  const ctx = window.SillyTavern.getContext();
  const {
    eventSource,
    event_types,
    generate: stGenerate,
    sendGenerationRequest,
    extractMessageFromData,
    characterId,
    mainApi,
  } = ctx as any;

  const writeToChat = Boolean(input?.writeToChat);
  const stream = Boolean(input?.stream);
  const onToken = typeof input?.onToken === 'function' ? input.onToken : undefined;
  const includeRequest = Boolean(input?.includeRequest);

  const timeoutMs = input?.timeoutMs ?? 8000;
  const chid = input?.forceCharacterId ?? characterId;

  if (chid === undefined || chid === null) {
    throw new Error('No character selected (characterId is undefined).');
  }

  const chOpt = input?.chatHistory;
  const hasChatOverride = Array.isArray(chOpt?.replace) || (Array.isArray(chOpt?.inject) && chOpt.inject.length > 0);
  if (writeToChat && hasChatOverride) {
    throw new Error('chatHistory.replace/inject is not supported when writeToChat=true (it would irreversibly alter the current chat).');
  }

  let request: BuildRequestOutput | undefined;
  if (!writeToChat || includeRequest) {
    request = await buildRequest(input);
  }

  // --- background mode: send request but do not write to chat ---
  if (!writeToChat) {
    const api = String(mainApi ?? '');
    let text = '';
    let streamedAny = false;
    let lastFull = '';

    const callOnToken = (full: string) => {
      if (!stream || !onToken) return;
      const delta = full.startsWith(lastFull) ? full.slice(lastFull.length) : full;
      lastFull = full;
      streamedAny = true;
      onToken(delta, full);
    };

    if (api === 'openai') {
      const messages = request?.chatCompletionMessages;
      if (!Array.isArray(messages)) {
        throw new Error('Background generate requires chatCompletionMessages (openai).');
      }

      const res = await Promise.resolve(sendGenerationRequest?.('normal', { prompt: messages }));

      // sendOpenAIRequest(stream=true) returns an async generator factory
      if (typeof res === 'function') {
        for await (const chunk of res()) {
          const full = String(chunk?.text ?? '');
          callOnToken(full);
        }
        text = lastFull;
      } else if (typeof extractMessageFromData === 'function') {
        text = String(extractMessageFromData(res, api) ?? '');
      } else {
        text = typeof res === 'string' ? res : String(res ?? '');
      }
    } else {
      const generateData = request?.generateData;
      if (generateData === undefined) {
        throw new Error('Background generate requires generateData (non-openai).');
      }

      const res = await Promise.resolve(sendGenerationRequest?.('normal', generateData));
      if (typeof extractMessageFromData === 'function') {
        text = String(extractMessageFromData(res, api) ?? '');
      } else {
        text = typeof res === 'string' ? res : String(res?.output ?? res?.text ?? '');
      }
    }

    // best-effort streaming fallback (non-openai / non-stream response)
    if (stream && onToken && !streamedAny) {
      onToken(text, text);
    }

    const out: GenerateOutput = {
      timestamp: Date.now(),
      characterId: chid,
      text,
      from: 'background',
      ...(includeRequest && request ? { request } : {}),
    };
    return out;
  }

  // --- in-chat mode: trigger SillyTavern native generation ---
  const restorers: Array<() => void> = [];
  let skipWIAN = false;

  // best-effort request snapshot for debugging
  const api = String(mainApi ?? '');

  // streaming state
  let streamedText = '';
  let streamedAny = false;

  const onStreamToken = (delta: any) => {
    const d = typeof delta === 'string' ? delta : String(delta ?? '');
    if (!d) return;
    streamedAny = true;
    streamedText += d;
    if (stream && onToken) onToken(d, streamedText);
  };

  const hasExtraBlocks = Array.isArray(input?.extraBlocks) && input.extraBlocks.length > 0;
  const onChatPromptReady = (data: any) => {
    if (!hasExtraBlocks) return;
    if (data?.dryRun === true) return;
    if (!Array.isArray(data?.chat) || data.chat.length === 0) return;
    // Only meaningful for chat-completions-like prompts.
    data.chat = insertExtraBlocks(data.chat, input.extraBlocks!);
  };

  try {
    // --- preset overrides (chat completion only, but safe to apply regardless) ---
    const presetOpt = input?.preset;
    const presetMode = String(presetOpt?.mode ?? 'current');
    const presetInject = presetOpt?.inject;
    const presetReplace = presetOpt?.replace;

    if (presetMode === 'disable') {
      const settings = ctx.chatCompletionSettings;
      const snapshot = { prompt_order: settings?.prompt_order };
      const promptOrderCharacterId = detectPromptOrderCharacterId(settings, 100001);

      const identifiers = Array.isArray(settings?.prompts)
        ? settings.prompts.map((p: any) => p?.identifier).filter((x: any) => typeof x === 'string' && x)
        : [];

      settings.prompt_order = [
        {
          character_id: promptOrderCharacterId,
          order: identifiers.map((identifier: string) => ({ identifier, enabled: false })),
        },
      ];

      restorers.push(() => {
        settings.prompt_order = snapshot.prompt_order;
      });
    } else if (presetInject || presetReplace) {
      if (presetInject && presetReplace) {
        throw new Error('preset.inject and preset.replace are mutually exclusive');
      }
      if (presetReplace) {
        const applied = applyPresetToChatCompletionSettings(ctx.chatCompletionSettings, presetReplace);
        restorers.push(applied.restore);
      } else if (presetInject) {
        const applied = applyPresetPatchToChatCompletionSettings(ctx.chatCompletionSettings, presetInject);
        restorers.push(applied.restore);
      }
    }

    // --- worldbook overrides ---
    skipWIAN = await applyWorldbookOverrides(ctx, input?.worldbook, restorers);

    return await new Promise<GenerateOutput>((resolve, reject) => {
      let done = false;
      let timer: any;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        if (stream) eventSource.removeListener(event_types.STREAM_TOKEN_RECEIVED, onStreamToken);
        if (hasExtraBlocks) eventSource.removeListener(event_types.CHAT_COMPLETION_PROMPT_READY, onChatPromptReady);
      };

      const finish = (err?: unknown, text?: string) => {
        if (done) return;
        done = true;
        cleanup();
        if (err) return reject(err);

        const outText = String(text ?? '');
        // fallback: if we had streaming tokens but no final text, use streamed aggregation
        const finalText = outText.trim() ? outText : (streamedAny ? streamedText : outText);

        // fallback: if stream requested but no tokens were observed, call once with finalText
        if (stream && onToken && !streamedAny && finalText) {
          onToken(finalText, finalText);
        }

        const out: GenerateOutput = {
          timestamp: Date.now(),
          characterId: chid,
          text: finalText,
          from: 'inChat',
          ...(includeRequest && request ? { request } : {}),
        };
        return resolve(out);
      };

      if (stream) eventSource.on(event_types.STREAM_TOKEN_RECEIVED, onStreamToken);
      if (hasExtraBlocks) eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, onChatPromptReady);

      timer = setTimeout(() => {
        finish(new Error(`Timeout: generation did not finish within ${timeoutMs}ms.`));
      }, timeoutMs);

      try {
        Promise.resolve(stGenerate('normal', { force_chid: chid, skipWIAN }, false))
          .then((res: any) => {
            if (typeof extractMessageFromData === 'function') {
              try {
                return finish(undefined, String(extractMessageFromData(res, api) ?? ''));
              } catch {
                return finish(undefined, String(res ?? ''));
              }
            }
            return finish(undefined, String(res ?? ''));
          })
          .catch((e: unknown) => finish(e));
      } catch (e) {
        finish(e);
      }
    });
  } finally {
    // always rollback in reverse order
    for (let i = restorers.length - 1; i >= 0; i--) {
      try {
        restorers[i]();
      } catch {
        // ignore rollback errors
      }
    }
  }
}
