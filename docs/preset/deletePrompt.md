# preset.deletePrompt

## 描述

从指定的采样预设中永久删除某个 Prompt 条目。如果未提供预设名称，则默认从当前活跃的预设中删除。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| presetName | string | (可选) 目标预设名称。如果不传，则使用当前激活的预设。 |
| identifier | string | 要删除的 Prompt 唯一 ID。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否删除成功。 |

## 示例

### 代码示例 (TypeScript)

```typescript
// 删除当前预设中 ID 为 "old_junk_123" 的 Prompt
await ST_API.preset.deletePrompt({
  identifier: "old_junk_123"
});
```

## 响应示例

```json
{
  "success": true
}
```
