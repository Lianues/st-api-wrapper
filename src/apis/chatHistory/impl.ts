import type { GetInput, GetOutput, ListInput, ListOutput, CreateInput, CreateOutput, UpdateInput, UpdateOutput, DeleteInput, DeleteOutput } from './types';
import { normalizeChatMessages } from '../../core/utils/messages';
import type { MessagePart } from '../../types';

/**
 * 列出聊天记录（消息数组）
 */
export async function list(input?: ListInput): Promise<ListOutput> {
  const ctx = window.SillyTavern.getContext();
  const rawChat = ctx.chat || [];

  const messages = await normalizeChatMessages(rawChat, {
    format: input?.format || 'gemini',
    mediaFormat: input?.mediaFormat,
    includeSwipes: input?.includeSwipes
  });

  const finalMessages = (input?.limit && input.limit > 0) 
    ? messages.slice(-input.limit) 
    : messages;

  return {
    messages: finalMessages,
    chatId: ctx.chatId,
  };
}

/**
 * 获取单条消息（按 index）
 */
export async function get(input: GetInput): Promise<GetOutput> {
  const ctx = window.SillyTavern.getContext();
  const rawChat = ctx.chat || [];
  const index = input?.index;

  if (typeof index !== 'number' || index < 0 || index >= rawChat.length) {
    throw new Error(`Message index out of bounds: ${index}`);
  }

  const normalized = await normalizeChatMessages([rawChat[index]], {
    format: input?.format || 'gemini',
    mediaFormat: input?.mediaFormat,
    includeSwipes: input?.includeSwipes,
  });

  return {
    index,
    message: normalized[0],
    chatId: ctx.chatId,
  };
}

/**
 * 创建新消息
 */
export async function create(input: CreateInput): Promise<CreateOutput> {
  const ctx = window.SillyTavern.getContext();
  
  const stMsg = await convertToStMessage(input.role, input.content, input.name);
  
  // 1. 插入数组
  ctx.chat.push(stMsg);
  const index = ctx.chat.length - 1;

  // 2. 渲染 UI
  if (typeof ctx.addOneMessage === 'function') {
    ctx.addOneMessage(stMsg, { forceId: index });
  }

  // 3. 持久化
  if (typeof ctx.saveChat === 'function') {
    await ctx.saveChat();
  }

  // 4. 返回完整归一化消息
  const normalized = await normalizeChatMessages([stMsg], { format: 'gemini' });

  return { 
    index,
    message: normalized[0]
  };
}

/**
 * 修改消息
 */
export async function update(input: UpdateInput): Promise<UpdateOutput> {
  const ctx = window.SillyTavern.getContext();
  const index = input.index;

  if (!ctx.chat || index < 0 || index >= ctx.chat.length) {
    throw new Error(`Message index out of bounds: ${index}`);
  }

  const existing = ctx.chat[index];
  
  if (input.role) {
    existing.is_user = input.role === 'user';
    existing.is_system = input.role === 'system';
  }
  
  if (input.name) {
    existing.name = input.name;
  }

  if (input.content) {
    const roleForConversion = input.role || (existing.is_user ? 'user' : existing.is_system ? 'system' : 'model');
    const converted = await convertToStMessage(roleForConversion, input.content, input.name || existing.name);
    existing.mes = converted.mes;
    if (converted.extra?.media) {
      existing.extra = { 
        ...existing.extra, 
        media: converted.extra.media,
        media_index: 0,
        inline_image: true
      };
    }
  }

  if (typeof ctx.saveChat === 'function') {
    await ctx.saveChat();
  }

  if (typeof ctx.updateMessageBlock === 'function') {
    ctx.updateMessageBlock(index, existing);
  } else {
    ctx.eventSource.emit(ctx.event_types.CHAT_CHANGED);
  }

  const normalized = await normalizeChatMessages([existing], { format: 'gemini' });

  return { 
    message: normalized[0]
  };
}

export async function deleteMessage(input: DeleteInput): Promise<DeleteOutput> {
  const ctx = window.SillyTavern.getContext();
  const index = input.index;

  if (!ctx.chat || index < 0 || index >= ctx.chat.length) {
    throw new Error(`Message index out of bounds: ${index}`);
  }

  if (typeof ctx.deleteMessage === 'function') {
    await ctx.deleteMessage(index);
  } else {
    ctx.chat.splice(index, 1);
    if (typeof ctx.saveChat === 'function') {
      await ctx.saveChat();
    }
    ctx.eventSource.emit(ctx.event_types.CHAT_CHANGED);
  }

  return { success: true };
}

/**
 * 辅助：将标准消息内容 (支持 Gemini 格式和 Base64 输入) 转换为酒馆内部格式
 */
async function convertToStMessage(role: string, content: string | MessagePart[], name?: string) {
  const ctx = window.SillyTavern.getContext();
  const isUser = role === 'user';
  const isSystem = role === 'system';
  
  let mes = '';
  const media: any[] = [];

  if (typeof content === 'string') {
    mes = content;
  } else if (Array.isArray(content)) {
    for (const part of content) {
      if ('text' in part) {
        mes += part.text;
      } else if ('fileData' in part) {
        media.push({
          url: part.fileData.fileUri,
          type: part.fileData.mimeType.startsWith('image') ? 'image' : 'file',
          mime_type: part.fileData.mimeType,
          source: 'upload'
        });
      } else if ('inlineData' in part) {
        // --- 核心修改：走全局 API 进行上传 ---
        const chName = ctx.name2 || 'default';
        const format = part.inlineData.mimeType.split('/')[1] || 'png';
        const fileName = `upload_${Date.now()}`;
        
        // 使用 window.ST_API 调用接口，避免内部循环引用或直接导入
        const res = await (window as any).ST_API.file.upload({
          data: part.inlineData.data,
          format: format,
          chName: chName,
          fileName: fileName
        });
        
        if (res && res.path) {
          media.push({
            url: res.path,
            type: 'image',
            mime_type: part.inlineData.mimeType,
            source: 'upload'
          });
        }
      }
    }
  }

  const result: any = {
    name: name || (isSystem ? 'System' : (isUser ? ctx.name1 : ctx.name2)),
    is_user: isUser,
    is_system: isSystem,
    mes,
    extra: {
      isSmallSys: isSystem
    },
    send_date: new Date().toISOString()
  };

  if (media.length > 0) {
    result.extra.media = media;
    result.extra.media_index = 0;
    result.extra.inline_image = true;
  }

  return result;
}
