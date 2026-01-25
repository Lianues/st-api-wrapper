# preset.list

## 描述

列出所有预设的**详细配置**（已做结构简化与 prompts 合并排序），并同时返回当前激活的预设名称。

适合用于：
- 枚举并读取每个预设的 prompts / 采样参数
- 快速获知当前激活预设（`active`）

## 输入

无

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| presets | PresetInfo[] | 预设详情列表。 |
| active | string | 当前激活的预设名称。 |

> 说明：`PresetInfo.utilityPrompts` 中的字段已从返回的 `PresetInfo.other` 中移除。

---

## 示例

### 代码示例 (TypeScript)

```typescript
const res = await ST_API.preset.list();
console.log('当前激活:', res.active);
console.log('全部预设详情:', res.presets);
```

## 响应示例

```json
{
  "active": "Default",
  "presets": [
    {
      "name": "Default",
      "prompts": [],
      "utilityPrompts": {
        "newChatPrompt": "[Start a new Chat]",
        "seed": -1
      },
      "regexScripts": [],
      "other": { "temp": 1.0 }
    }
  ]
}
```

