# preset.createPrompt

## 描述

在指定的采样预设中创建一个新的 Prompt 条目。如果未提供预设名称，则默认在当前活跃的预设中创建。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| presetName | string | (可选) 目标预设名称。如果不传，则使用当前激活的预设。 |
| prompt | object | Prompt 数据对象。`identifier` 若不传则自动生成。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否创建成功。 |
| prompt | PromptInfo | 创建成功的完整 Prompt 对象。 |

## 示例

### 代码示例 (TypeScript)

```typescript
// 在当前预设中创建一个新 Prompt
const res = await ST_API.preset.createPrompt({
  prompt: {
    name: "AI Roleplay Tool",
    content: "Act as a dungeon master...",
    role: "system",
    enabled: true
  }
});

if (res.success) {
  console.log('新 Prompt 已生成，ID 为:', res.prompt.identifier);
}
```

## 响应示例

```json
{
  "success": true,
  "prompt": {
    "identifier": "550e8400-e29b-41d4-a716-446655440000",
    "name": "AI Roleplay Tool",
    "enabled": true,
    "role": "system",
    "content": "Act as a dungeon master...",
    "depth": 0,
    "order": 100,
    "position": "relative",
    "trigger": []
  }
}
```
