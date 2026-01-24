# chatHistory.get

## 描述

按消息索引 `index` 获取**单条**聊天消息，并返回归一化后的结构（Gemini/OpenAI）以及当前聊天 ID。

> 如需获取消息列表，请使用 `chatHistory.list()`。

## 输入

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| index | number | - | 要获取的消息索引（从 0 开始）。 |
| format | 'gemini' \| 'openai' | 'gemini' | 返回的消息结构。'gemini' 支持多模态 parts；'openai' 为纯文本有损转换。 |
| mediaFormat | 'url' \| 'base64' | 'url' | 图片附件的处理方式。'base64' 会自动通过浏览器 fetch 并转换。 |
| includeSwipes | boolean | false | 是否包含该轮次的所有分支 (Swipes)。仅对 AI 消息有效。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| index | number | 返回的消息索引。 |
| message | ChatMessage | 归一化后的消息对象。 |
| chatId | string \| number \| undefined | 当前聊天的唯一标识符。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 获取第 0 条消息
const res = await ST_API.chatHistory.get({ index: 0 });
console.log('chatId:', res.chatId);
console.log('message:', res.message);
```

## 响应示例

```json
{
  "index": 0,
  "message": {
    "role": "user",
    "parts": [{ "text": "看图" }]
  },
  "chatId": "2025-9-8 @00h 06m"
}
```
