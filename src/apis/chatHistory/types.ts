import type { ChatMessage, MessagePart } from '../../types';

export interface ListInput {
  /** 可选：限制返回的消息数量 */
  limit?: number;

  /** 
   * 返回格式
   * @default 'gemini' 
   */
  format?: 'gemini' | 'openai';

  /** 
   * 媒体文件处理方式
   * @default 'url'
   */
  mediaFormat?: 'url' | 'base64';

  /**
   * 是否包含所有分支 (Swipes)
   * 如果为 true，返回的对象中将包含 swipes 数组。
   * @default false
   */
  includeSwipes?: boolean;
}

export interface ListOutput {
  messages: ChatMessage[];
  chatId: string | number | undefined;
}

export interface GetInput {
  /** 要获取的消息索引 */
  index: number;

  /** 
   * 返回格式
   * @default 'gemini' 
   */
  format?: 'gemini' | 'openai';

  /** 
   * 媒体文件处理方式
   * @default 'url'
   */
  mediaFormat?: 'url' | 'base64';

  /**
   * 是否包含所有分支 (Swipes)
   * 如果为 true，返回的对象中将包含 swipes 数组。
   * @default false
   */
  includeSwipes?: boolean;
}

export interface GetOutput {
  index: number;
  message: ChatMessage;
  chatId: string | number | undefined;
}

export interface CreateInput {
  /** 角色: 'user' | 'model' | 'system' */
  role: 'user' | 'model' | 'system';
  /** 内容：推荐使用 MessagePart[] 以支持多模态 */
  content: string | MessagePart[];
  /** 可选：发送者名称 */
  name?: string;
}

export interface CreateOutput {
  /** 新消息在列表中的索引 */
  index: number;
  /** 完整的消息对象 */
  message: ChatMessage;
}

export interface UpdateInput {
  /** 消息索引 */
  index: number;
  /** 可选：修改角色 */
  role?: 'user' | 'model' | 'system';
  /** 可选：修改内容 (string 或 MessagePart[]) */
  content?: string | MessagePart[];
  /** 可选：修改名称 */
  name?: string;
}

export interface UpdateOutput {
  /** 修改后的完整消息对象 */
  message: ChatMessage;
}

export interface DeleteInput {
  /** 要删除的消息索引 */
  index: number;
}

export interface DeleteOutput {
  success: boolean;
}
