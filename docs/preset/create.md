# preset.create

## 描述

创建一个新的采样预设（Sampling Preset）。
默认会以当前活跃的预设作为模板进行复制，并在其基础上应用您提供的修改。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 新预设的名称。 |
| other | object | (可选) 采样参数修改（如温度、Top P 等）。 |
| utilityPrompts | UtilityPrompts | (可选) Utility Prompts（请放这里，不要混在 `other` 里）。 |
| prompts | PromptInfo[] | (可选) Prompt 列表修改。如果提供，将替换原有的所有 Prompt。 |
| regexScripts | RegexScriptData[] | (可选) 预设绑定的正则脚本列表（会写入 `other.extensions.regex_scripts`）。 |

> 提示：Utility Prompts（例如 `newChatPrompt`、`worldInfoFormat`、`scenarioFormat` 等）请通过 `utilityPrompts` 传入；不允许混在 `other` 里。

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否创建成功。 |
| name | string | 最终创建的预设名称。 |

## 示例

### 代码示例 (TypeScript)

```typescript
// 创建一个名为 "Extreme Creative" 的新预设
await ST_API.preset.create({
  name: "Extreme Creative",
  other: {
    temp: 2.0,
    top_p: 0.9
  }
});
```

## 响应示例

```json
{
  "success": true,
  "name": "Extreme Creative"
}
```
