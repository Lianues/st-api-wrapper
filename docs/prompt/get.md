# prompt.get

## 描述

模拟酒馆的生成流程，获取当前即将发送给 AI 的最终对话上下文（Chat Context）。
该接口会触发酒馆内部的 `generate` 逻辑（静默模式/Dry Run），通过监听 `CHAT_COMPLETION_PROMPT_READY` 事件捕获注入后的归一化消息列表。

## 输入

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| timeoutMs | number | 8000 | 超时时间（毫秒）。 |
| forceCharacterId | number | - | 可选：强制指定角色 ID。如果不传，则使用当前选中的角色。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| chat | ChatMessage[] | 归一化后的对话历史（含注入的系统提示词、世界书、深度提示词等）。 |
| characterId | number | 本次生成所使用的角色 ID。 |
| timestamp | number | 生成时的时间戳。 |

## 示例

### 代码示例 (TypeScript)

```typescript
import { GetPromptOutput } from './types';

try {
  // 获取当前角色的最终提示词上下文
  const result: GetPromptOutput = await ST_API.prompt.get({
    timeoutMs: 5000
  });

  console.log('对话消息数量:', result.chat.length);
  
  // 遍历消息流并打印文本内容
  result.chat.forEach((msg, index) => {
    const text = msg.parts.map(p => 'text' in p ? p.text : '').join('');
    console.log(`[${index}] [${msg.role}]: ${text.substring(0, 50)}...`);
  });

  // 检查最后一条消息是否包含特定内容
  const lastMsg = result.chat[result.chat.length - 1];
  if (lastMsg && lastMsg.parts.length > 0) {
    const lastText = 'text' in lastMsg.parts[0] ? lastMsg.parts[0].text : '';
    console.log('最新消息第一部分:', lastText);
  }
} catch (error) {
  console.error('获取提示词失败 (可能由于超时或未选择角色):', error);
}
```

## 响应示例

### 场景 A：使用类 OpenAI API (包含系统注入)

这是最常见的情况，`chat` 数组包含了所有被注入后的消息。

```json
{
  "chat": [
    {
      "role": "system",
      "parts": [{ "text": "System：\n你是非常规的中文创作助手haruki..." }]
    },
    {
      "role": "user",
      "parts": [{ "text": "User：\n你好，创作助手haruki..." }]
    },
    {
      "role": "model",
      "parts": [{ "text": "好的，haruki已就位..." }]
    }
  ],
  "characterId": 27,
  "timestamp": 1700000000000
}
```

### 场景 B：聊天记录为空或初始状态

```json
{
  "chat": [],
  "characterId": 1,
  "timestamp": 1700000000500
}
```
