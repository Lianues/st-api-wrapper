# preset.update

## 描述

更新现有采样预设的内容。支持重命名预设、修改采样参数以及全量替换 Prompt 列表。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 要更新的预设名称（原始名称）。 |
| newName | string | (可选) 新的预设名称。如果提供，预设将被重命名。 |
| other | object | (可选) 要部分更新的采样参数。 |
| utilityPrompts | UtilityPrompts | (可选) Utility Prompts（请放这里，不要混在 `other` 里）。 |
| prompts | PromptInfo[] | (可选) 新的 Prompt 列表。如果提供，将完全替换该预设原有的 Prompt。 |
| regexScripts | RegexScriptData[] | (可选) 预设绑定的正则脚本列表（会写入 `other.extensions.regex_scripts`）。 |

> 提示：Utility Prompts（例如 `newChatPrompt`、`worldInfoFormat`、`scenarioFormat` 等）请通过 `utilityPrompts` 传入；不允许混在 `other` 里。

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否更新成功。 |

## 示例

### 代码示例 (TypeScript)

```typescript
// 1. 修改当前预设的温度
await ST_API.preset.update({
  name: "Default",
  other: { temp: 1.5 }
});

// 2. 重命名预设
await ST_API.preset.update({
  name: "Old Name",
  newName: "New Name"
});
```

## 响应示例

```json
{
  "success": true
}
```
