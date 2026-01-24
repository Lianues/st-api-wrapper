import type { ChatMessage, MessagePart } from '../../types';

/**
 * 消息归一化选项
 */
export interface NormalizeOptions {
  format?: 'gemini' | 'openai';
  mediaFormat?: 'url' | 'base64';
  includeSwipes?: boolean;
}

/**
 * 酒馆内部原始消息格式
 */
export type RawStMessage = {
  mes: string;
  is_user: boolean;
  is_system: boolean;
  name?: string;
  swipe_id?: number;
  swipes?: string[];
  swipe_info?: Array<{
    extra?: {
      media?: Array<{
        url: string;
        type: string;
        mime_type?: string;
      }>;
    };
  }>;
  extra?: any;
};

/**
 * 将酒馆原始消息数组转换为标准格式
 */
export async function normalizeChatMessages(raw: unknown, options: NormalizeOptions = {}): Promise<ChatMessage[]> {
  if (!Array.isArray(raw)) return [];
  const format = options.format || 'gemini';
  const mediaFormat = options.mediaFormat || 'url';
  const includeSwipes = !!options.includeSwipes;

  const results = await Promise.all((raw as RawStMessage[]).map(async (m) => {
    let role: string;
    if (m.is_user) role = 'user';
    else if (m.is_system) role = 'system';
    else role = format === 'gemini' ? 'model' : 'assistant';

    const base: any = { 
      role, 
      ...(m.name ? { name: m.name } : {}),
      swipeId: m.swipe_id ?? 0
    };

    if (format === 'openai') {
      base.content = m.mes || '';
      if (includeSwipes && m.swipes) base.swipes = m.swipes;
    } else {
      base.parts = await buildParts(m.mes, m.extra?.media, mediaFormat);
      if (includeSwipes && m.swipes) {
        base.swipes = await Promise.all(m.swipes.map((text, idx) => {
          const swipeMedia = m.swipe_info?.[idx]?.extra?.media;
          return buildParts(text, swipeMedia, mediaFormat);
        }));
      }
    }

    return base as ChatMessage;
  }));

  return results;
}

/**
 * 辅助：构建 Gemini Parts
 */
async function buildParts(text: string, media: any[] | undefined, mediaFormat: 'url' | 'base64'): Promise<MessagePart[]> {
  const parts: MessagePart[] = [];
  if (text) parts.push({ text });

  if (media && Array.isArray(media)) {
    for (const item of media) {
      const mimeType = item.mime_type || (item.type === 'image' ? 'image/png' : 'application/octet-stream');
      if (mediaFormat === 'base64') {
        const b64 = await imageUrlToBase64(item.url);
        if (b64) parts.push({ inlineData: { mimeType, data: b64 } });
      } else {
        parts.push({ fileData: { mimeType, fileUri: item.url } });
      }
    }
  }
  return parts;
}

/**
 * 辅助：将 URL 转为 Base64
 */
export async function imageUrlToBase64(url: string): Promise<string | null> {
  if (url.startsWith('data:')) return url.split(',')[1];
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('[ST API] Base64 conversion failed:', e);
    return null;
  }
}
