# preset.updatePrompt

## 描述

更新预设中现有 Prompt 条目的字段。如果未提供预设名称，则默认修改当前活跃预设中的内容。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| presetName | string | (可选) 目标预设名称。如果不传，则使用当前激活的预设。 |
| identifier | string | 要修改的 Prompt 唯一 ID。 |
| update | object | 要更新的字段集。支持修改 content, role, enabled, depth, order, position 等。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否更新成功。 |
| prompt | PromptInfo | 更新后的完整 Prompt 对象。 |

## 示例

### 代码示例 (TypeScript)

```typescript
// 将当前预设中的 "Main Prompt" 修改为不启用
await ST_API.preset.updatePrompt({
  identifier: "main",
  update: {
    enabled: false
  }
});
```

## 响应示例

```json
{
  "success": true,
  "prompt": {
    "identifier": "main",
    "name": "Main Prompt",
    "enabled": false,
    "role": "system",
    "content": "...",
    "depth": 0,
    "order": 100,
    "position": "relative",
    "trigger": []
  }
}
```
