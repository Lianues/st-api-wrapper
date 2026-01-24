/**
 * 通用消息 Part 定义 (参考 Gemini 格式)
 */
export type MessagePart = 
  | { text: string }
  | { inlineData: { mimeType: string; data: string } } // Base64 模式
  | { fileData: { mimeType: string; fileUri: string } }; // URI 模式

/**
 * 消息结构 (支持 Gemini 和 OpenAI 风格，并包含多分支信息)
 */
export type ChatMessage = {
  role: string;
  name?: string;
  /** 当前选中的分支索引 (从 0 开始) */
  swipeId?: number;
} & (
  | { 
      /** 当前选中的内容 parts */
      parts: MessagePart[]; 
      /** 所有的分支内容列表 (仅在 includeSwipes 为 true 时存在) */
      swipes?: MessagePart[][]; 
    }
  | { 
      /** 当前选中的内容字符串 */
      content: string; 
      /** 所有的分支内容列表 (仅在 includeSwipes 为 true 时存在) */
      swipes?: string[]; 
    }
);

export interface PromptResult {
  prompt: string;
  chat: ChatMessage[];
  characterId?: number;
  mainApi?: string;
  timestamp?: number;
}
