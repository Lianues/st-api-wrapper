# worldbook.get

## 描述

获取指定名称和作用域的世界书完整内容（包含所有条目）。该接口使用了经过整理的友好结构，将常用字段提取到顶层，条目以数组形式返回。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 世界书名称。如果是聊天书，通常传 "Current Chat"。 |
| scope | WorldBookScope | 否 | 作用域。可选：`global`, `character`, `chat`。如果不传将按该顺序尝试查找。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| worldBook | WorldBook | 书的内容。 |
| scope | string | 实际找到书的作用域。 |

### WorldBook 结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 名称。 |
| entries | WorldBookEntry[] | 条目列表。 |

### WorldBookEntry 常用字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| index | number | 条目索引（对应 ST 的 UID）。 |
| name | string | 条目名称（对应原始的 comment 字段）。 |
| content | string | 条目内容。 |
| enabled | boolean | 是否启用。该字段映射酒馆原始条目的 `disable` 字段（取反）。 |
| activationMode | string | 触发模式。可选：`keyword` (靠关键词), `always` (始终触发), `vector` (靠向量索引)。 |
| key | string[] | 关键词列表。 |
| secondaryKey | string[] | 副关键词列表。 |
| selectiveLogic | string | 选择逻辑。可选：`andAny` (AND ANY), `andAll` (AND ALL), `notAll` (NOT ALL), `notAny` (NOT ANY)。 |
| role | string \| null | 插入角色。仅在 `position` 为 `fixed` 时有效，不使用时回传 `null`。可选：`system`, `user`, `model`。 |
| caseSensitive | boolean \| null | 是否区分大小写。null: 使用全局设置, true: 开启, false: 关闭。 |
| excludeRecursion | boolean | 是否不可递归（不会被其他条目激活）。 |
| preventRecursion | boolean | 防止进一步递归（不会激活其他条目）。 |
| probability | number | 触发概率 (0-100)。 |
| position | string | 插入位置。映射见下方表格。 |
| order | number | 插入顺序。 |
| depth | number | 插入深度（当 position 为 fixed 时生效）。 |
| other | object | 其他原始字段。 |

#### Position 枚举值映射

| 值 | ST 原始值 | 说明 |
| --- | --- | --- |
| `beforeChar` | 0 | 角色定义之前 |
| `afterChar` | 1 | 角色定义之后 |
| `beforeEm` | 5 | 示例消息之前 |
| `afterEm` | 6 | 示例消息之后 |
| `beforeAn` | 2 | 作者注释之前 |
| `afterAn` | 3 | 作者注释之后 |
| `fixed` | 4 | 固定深度（@D）。需要配合 `role` 字段使用。 |
| `outlet` | 7 | Outlet |

#### Role 枚举值映射 (仅 fixed 位置)

| 值 | ST 原始值 | 说明 |
| --- | --- | --- |
| `system` | 0 | 系统深度 @D |
| `user` | 1 | 用户深度 @D |
| `model` | 2 | AI 深度 @D |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 获取名为 "参考用main_world" 的世界书
const result = await ST_API.worldbook.get({ name: "参考用main_world" });
console.log(`找到书籍的作用域: ${result.scope}`);
console.log(`包含条目数量: ${result.worldBook.entries.length}`);

// 访问第一个条目的内容
if (result.worldBook.entries.length > 0) {
  console.log("第一个条目内容:", result.worldBook.entries[0].content);
}
```

### 响应示例

```json
{
  "worldBook": {
    "name": "参考用main_world",
    "entries": [
      {
        "index": 0,
        "name": "未来都市",
        "key": ["新星港", "都市"],
        "activationMode": "keyword",
        "secondaryKey": ["未来", "科幻"],
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
    ]
  },
  "scope": "global"
}
```
