import type {
  BuildRequestInput,
  BuildRequestOutput,
  ChatCompletionMessage,
  ExtraMessageBlock,
  GetPromptInput,
  GetPromptOutput,
} from './types';
import { normalizeChatMessages } from '../../core/utils/messages';
import { chatMessagesToStChat } from '../../core/utils/chat';
import { applyPresetToChatCompletionSettings, detectPromptOrderCharacterId } from '../../core/utils/preset';
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

/**
 * 获取当前提示词（最终发送给 API 的结果）
 */
export async function get(input: GetPromptInput): Promise<GetPromptOutput> {
  const ctx = window.SillyTavern.getContext();
  const { eventSource, event_types, generate, characterId, mainApi } = ctx;

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
      if (chat.length === 0) return;

      finish(undefined, {
        prompt: data?.prompt || '',
        chat,
        characterId: chid,
        mainApi: String(mainApi ?? ''),
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
    const presetOpt = input?.preset ?? { mode: 'current' as const };
    if (presetOpt.mode === 'inject') {
      if (!presetOpt.preset) throw new Error('preset.mode=inject requires preset.preset');
      const applied = applyPresetToChatCompletionSettings(ctx.chatCompletionSettings, presetOpt.preset);
      restorers.push(applied.restore);
    } else if (presetOpt.mode === 'disable') {
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
    }

    // --- worldbook overrides ---
    const wbOpt = input?.worldbook ?? { mode: 'current' as const };
    if (wbOpt.mode === 'disable') {
      skipWIAN = true;
    } else if (wbOpt.mode === 'inject') {
      if (!wbOpt.worldBook) throw new Error('worldbook.mode=inject requires worldbook.worldBook');
      const snapshot = ctx.chatMetadata?.world_info;
      if (!ctx.chatMetadata) throw new Error('chatMetadata not available in context');
      ctx.chatMetadata.world_info = worldBookToStWorldInfo(wbOpt.worldBook);
      restorers.push(() => {
        ctx.chatMetadata.world_info = snapshot;
      });
    }

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
          mainApi: api,
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
