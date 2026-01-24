import type { ChatMessage, MessagePart } from '../../types';
import type { RawStMessage } from './messages';

function roleToStFlags(role: string) {
  const r = String(role || '').toLowerCase();
  if (r === 'user') return { is_user: true, is_system: false };
  if (r === 'system') return { is_user: false, is_system: true };
  // assistant / model / tool / etc → treat as assistant-like
  return { is_user: false, is_system: false };
}

function partsToText(parts: MessagePart[] | undefined): string {
  if (!Array.isArray(parts)) return '';
  return parts
    .map((p) => ('text' in p ? p.text : ''))
    .filter((t) => t)
    .join('');
}

function partsToMedia(parts: MessagePart[] | undefined) {
  const media: any[] = [];
  if (!Array.isArray(parts)) return media;

  for (const part of parts) {
    if ('fileData' in part) {
      const mimeType = part.fileData.mimeType;
      media.push({
        url: part.fileData.fileUri,
        type: mimeType?.startsWith('image') ? 'image' : 'file',
        mime_type: mimeType,
        source: 'injected',
      });
    } else if ('inlineData' in part) {
      const mimeType = part.inlineData.mimeType;
      const dataUrl = `data:${mimeType};base64,${part.inlineData.data}`;
      media.push({
        url: dataUrl,
        type: mimeType?.startsWith('image') ? 'image' : 'file',
        mime_type: mimeType,
        source: 'injected',
      });
    }
  }

  return media;
}

function swipeToText(swipe: string | MessagePart[]): string {
  if (typeof swipe === 'string') return swipe;
  return partsToText(swipe);
}

/**
 * 将 wrapper ChatMessage[] 转为酒馆内部 chat[]（RawStMessage[]）。
 * 说明：
 * - 仅保证文本/基础 media 字段可用（media 用 data: URL 或原 url）；不会做上传落盘。
 * - 主要用途是给 dry-run prompt 合成提供“临时聊天记录”。
 */
export async function chatMessagesToStChat(messages: ChatMessage[]): Promise<RawStMessage[]> {
  if (!Array.isArray(messages)) return [];

  return messages.map((m) => {
    const { is_user, is_system } = roleToStFlags(m.role);
    const name = m.name;
    const swipe_id = typeof m.swipeId === 'number' ? m.swipeId : undefined;

    let mes = '';
    let media: any[] = [];

    if ('content' in m) {
      mes = String((m as any).content ?? '');
    } else if ('parts' in m) {
      mes = partsToText((m as any).parts);
      media = partsToMedia((m as any).parts);
    }

    const raw: RawStMessage = {
      mes,
      is_user,
      is_system,
      ...(name ? { name } : {}),
      ...(swipe_id !== undefined ? { swipe_id } : {}),
    };

    // swipes
    const swipes = (m as any).swipes;
    if (Array.isArray(swipes) && swipes.length > 0) {
      raw.swipes = swipes.map(swipeToText);
    }

    if (media.length > 0) {
      raw.extra = {
        ...(raw.extra || {}),
        media,
        media_index: 0,
        inline_image: true,
      };
    }

    return raw;
  });
}

