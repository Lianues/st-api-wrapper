# chatHistory.list

## 描述

获取当前对话的聊天记录（消息数组）。该接口支持以下核心特性：
- **格式归一化**：支持纯正的 Gemini 风格（默认，`role` + `parts`）和 OpenAI 风格（`role` + `content`）。
- **多模态支持**：自动提取消息中的图片附件，支持返回原始 URL 或直接转为 Base64 字符串。
- **分支历史**：支持获取 AI 消息的所有生成分支（Swipes）。

> 如需获取单条消息，请使用 `chatHistory.get({ index })`。

## 输入

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| limit | number | - | 可选：限制返回的消息数量（从最近的消息开始截取）。 |
| format | 'gemini' \| 'openai' | 'gemini' | 返回的消息结构。'gemini' 支持多模态 parts；'openai' 为纯文本有损转换。 |
| mediaFormat | 'url' \| 'base64' | 'url' | 图片附件的处理方式。'base64' 会自动通过浏览器 fetch 并转换。 |
| includeSwipes | boolean | false | 是否包含该轮次的所有分支 (Swipes)。仅对 AI 消息有效。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| messages | ChatMessage[] | 归一化后的消息数组。 |
| chatId | string \| number \| undefined | 当前聊天的唯一标识符。 |

---

## 示例

### 1. 基础用法 (默认 Gemini 格式)

```typescript
import { ListOutput } from './types';

// 获取最后 5 条消息
const res: ListOutput = await ST_API.chatHistory.list({ limit: 5 });

res.messages.forEach(msg => {
  if ('parts' in msg) {
    console.log(`[${msg.role}]`, msg.parts.map(p => 'text' in p ? p.text : '[Media]'));
  }
});
```

### 2. 多模态支持 (图片转 Base64)

自动将酒馆内的图片附件转换为 Base64 编码，适合直接发送给外部 AI API。

```typescript
const res = await ST_API.chatHistory.list({ 
  limit: 1, 
  mediaFormat: 'base64' 
});

const lastMsg = res.messages[0];
if ('parts' in lastMsg) {
  const imagePart = lastMsg.parts.find(p => 'inlineData' in p);
  if (imagePart) {
    // @ts-ignore
    console.log('Base64 数据片段:', imagePart.inlineData.data.substring(0, 50) + '...');
  }
}
```

### 3. 获取完整分支历史 (Swipes)

获取 AI 生成过的所有版本，而不仅仅是当前选中的那个。

```typescript
const res = await ST_API.chatHistory.list({ 
  limit: 1, 
  includeSwipes: true 
});

const aiMsg = res.messages[0];
if ('swipes' in aiMsg && aiMsg.swipes) {
  console.log(`当前选中第 ${aiMsg.swipeId} 个分支`);
  console.log(`总共有 ${aiMsg.swipes.length} 个分支可供选择`);
}
```

## 响应示例 (Gemini + Swipes + Media)

```json
{
  "messages": [
    {
      "name": "User222",
      "role": "user",
      "parts": [
        { "text": "看图" },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "/user/images/浅野 响子/123.png"
          }
        }
      ]
    },
    {
      "role": "model",
      "swipeId": 0,
      "parts": [{ "text": "这是分支 1 的内容" }],
      "swipes": [
        [{ "text": "这是分支 1 的内容" }],
        [{ "text": "这是分支 2 的内容" }]
      ]
    }
  ],
  "chatId": "2025-9-8 @00h 06m"
}
```

