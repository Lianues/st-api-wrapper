# worldBook.updateEntry

## 描述

更新指定世界书中的现有条目。支持增量更新（Patch 模式，只需传入需要修改的字段）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 世界书名称。 |
| index | number | 是 | 条目索引（UID）。 |
| patch | Partial\<Omit\<WorldBookEntry, 'index'\>\> | 是 | 需要修改的字段。支持 `name`, `content`, `activationMode`, `key`, `secondaryKey`, `selectiveLogic`, `caseSensitive`, `excludeRecursion`, `preventRecursion`, `probability`, `position`, `role`, `depth`, `order`, `enabled`, `other`。 |
| scope | WorldBookScope | 否 | 作用域。 |

### Position 与 Role 映射说明

详见 [worldBook.get](./get.md) 或 [worldBook.createEntry](./createEntry.md) 中的表格。

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| entry | WorldBookEntry | 更新后的条目完整数据。 |
| ok | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.worldBook.updateEntry({
  name: "参考用main_world",
  index: 0,
  patch: {
    enabled: false,
    name: "暂时停用的都市"
  }
});
```

### 响应示例

```json
{
  "entry": {
    "index": 0,
    "name": "暂时停用的都市",
    "key": ["新星港", "都市"],
    "activationMode": "keyword",
    "secondaryKey": ["未来"],
    "selectiveLogic": "andAny",
    "role": null,
    "caseSensitive": false,
    "excludeRecursion": false,
    "preventRecursion": false,
    "probability": 100,
    "content": "故事发生在一座名为“新星港”的未来都市。这里科技高度发达，悬浮车穿梭于摩天大楼之间。",
    "enabled": false,
    "position": "beforeChar",
    "order": 5,
    "depth": 0,
    "other": {
      "selective": true,
      "addMemo": true,
      "ignoreBudget": false,
      "matchPersonaDescription": false,
      "matchCharacterDescription": false,
      "matchCharacterPersonality": false,
      "matchCharacterDepthPrompt": false,
      "matchScenario": false,
      "matchCreatorNotes": false,
      "delayUntilRecursion": false,
      "useProbability": true,
      "outletName": "",
      "group": "",
      "groupOverride": false,
      "groupWeight": 100,
      "scanDepth": null,
      "matchWholeWords": null,
      "useGroupScoring": null,
      "automationId": "",
      "sticky": 0,
      "cooldown": 0,
      "delay": 0,
      "triggers": [],
      "displayIndex": 0
    }
  },
  "ok": true
}
```
