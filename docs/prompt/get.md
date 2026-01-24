# prompt.get

## 描述

模拟酒馆的生成流程，获取当前即将发送给 AI 的最终提示词（Final Prompt）。
该接口会触发酒馆内部的 `generate` 逻辑（静默模式），捕获所有注入后的结果。

## 输入

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| timeoutMs | number | 8000 | 超时时间（毫秒）。 |
| forceCharacterId | number | - | 可选：强制指定角色 ID。如果不传，则使用当前选中的角色。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| prompt | string | 最终生成的纯文本提示词。 |
| chat | ChatMessage[] | 归一化后的对话历史（含注入的系统提示词等）。 |
| characterId | number | 本次生成所使用的角色 ID。 |
| mainApi | string | 当前酒馆使用的 API 类型。 |
| timestamp | number | 生成时的时间戳。 |

## 示例

### 代码示例 (TypeScript)

```typescript
import { GetPromptOutput } from './types';

try {
  const result: GetPromptOutput = await ST_API.prompt.get({
    timeoutMs: 5000
  });

  console.log('最终文本提示词:', result.prompt);
  console.log('对话消息数量:', result.chat.length);
  
  // 检查最后一条消息是否包含特定的注入内容
  const lastMsg = result.chat[result.chat.length - 1];
  if ('parts' in lastMsg) {
    console.log('最新消息文本:', lastMsg.parts[0]);
  }
} catch (error) {
  console.error('获取提示词失败:', error);
}
```

## 响应示例

```json
{
  "prompt": "System: 你现在扮演响子...\nUser: 你好\nAssistant: ",
  "chat": [
    {
      "role": "system",
      "parts": [{ "text": "你现在扮演响子..." }]
    },
    {
      "role": "user",
      "name": "User222",
      "parts": [{ "text": "你好" }]
    }
  ],
  "characterId": 0,
  "mainApi": "openai",
  "timestamp": 1700000000000
}
```
