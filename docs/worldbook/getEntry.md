# worldbook.getEntry

## 描述

从指定世界书中获取一个特定的条目。该接口返回整理后的友好结构。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 世界书名称。 |
| index | number | 是 | 条目索引（UID）。 |
| scope | WorldBookScope | 否 | 作用域。 |

### WorldBookEntry 结构

详见 [worldbook.get](./get.md) 或 [worldbook.createEntry](./createEntry.md) 中的字段说明。

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.worldbook.getEntry({ 
  name: "参考用main_world", 
  index: 0 
});
console.log("条目名称:", result.entry.name);
console.log("条目内容:", result.entry.content);
```

### 响应示例

```json
{
  "entry": {
    "index": 0,
    "name": "未来都市",
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
    "enabled": true,
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
  }
}
```
