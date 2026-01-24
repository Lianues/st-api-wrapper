# preset.getPrompt

## 描述

从指定的采样预设中获取特定 Prompt 条目的详细信息。如果未提供预设名称，则默认从当前活跃的预设中获取。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| presetName | string | (可选) 预设名称。如果不传，则使用当前激活的预设。 |
| identifier | string | Prompt 的唯一标识符。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| prompt | PromptInfo | 找到的 Prompt 条目对象。 |

## 示例

### 代码示例 (TypeScript)

```typescript
// 从当前预设中获取 identifier 为 "main" 的条目
const res = await ST_API.preset.getPrompt({
  identifier: "main"
});
console.log('Prompt 名称:', res.prompt.name);
```

## 响应示例

```json
{
  "prompt": {
    "identifier": "main",
    "name": "Main Prompt",
    "enabled": true,
    "role": "system",
    "content": "你是一个助手...",
    "depth": 0,
    "order": 100,
    "position": "relative",
    "trigger": []
  }
}
```
