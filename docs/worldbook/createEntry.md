# worldBook.createEntry

## 描述

在指定的世界书中创建一个新条目。该接口使用了经过整理的友好结构，将常用字段提取到顶层，不常用的字段放入 `other` 中。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 世界书名称。 |
| scope | WorldBookScope | 否 | 作用域：`global` (默认), `character`, `chat`。 |
| entry | Partial\<WorldBookEntry\> | 是 | 条目数据（不包含 `index`，系统会自动分配）。 |

### entry 常用字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 条目名称（对应原始的 comment 字段）。 |
| content | string | 条目内容。 |
| enabled | boolean | 是否启用。该字段映射酒馆原始条目的 `disable` 字段（取反）。 |
| activationMode | string | 触发模式。可选：`keyword`, `always`, `vector`。 |
| key | string[] | 关键词列表。 |
| secondaryKey | string[] | 副关键词列表。 |
| selectiveLogic | string | 选择逻辑。可选：`andAny`, `andAll`, `notAll`, `notAny`。 |
| role | string \| null | 插入角色。仅在 `position` 为 `fixed` 时有效，不使用时回传 `null`。可选：`system`, `user`, `model`。 |
| caseSensitive | boolean \| null | 是否区分大小写。null: 使用全局设置, true: 开启, false: 关闭。 |
| excludeRecursion | boolean | 是否不可递归（不会被其他条目激活）。 |
| preventRecursion | boolean | 防止进一步递归（不会激活其他条目）。 |
| probability | number | 触发概率 (0-100)。 |
| position | string | 插入位置。映射见下方表格。可选：`beforeChar`, `afterChar`, `beforeEm`, `afterEm`, `beforeAn`, `afterAn`, `fixed`, `outlet`。 |
| role | string | 插入角色。仅在 `position` 为 `fixed` 时有效。可选：`system`, `user`, `model`。 |
| order | number | 插入顺序。 |
| depth | number | 插入深度（当 position 为 fixed 时生效）。 |
| other | object | 其他原始字段（如 `key`, `selective` 等）。 |

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

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| entry | WorldBookEntry | 创建成功的完整条目数据。 |
| ok | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

#### 创建普通条目

```typescript
const result = await ST_API.worldBook.createEntry({
  name: "参考用main_world",
  entry: {
    name: "未来都市",
    key: ["新星港", "都市"],
    activationMode: "keyword",
    secondaryKey: ["未来"],
    selectiveLogic: "andAny",
    caseSensitive: false,
    excludeRecursion: false,
    preventRecursion: false,
    probability: 95,
    content: "故事发生在一座名为“新星港”的未来都市。这里科技高度发达，悬浮车穿梭于摩天大楼之间。",
    enabled: true,
    position: "beforeChar",
    order: 5,
    depth: 0,
    other: {
        // 其他字段...
    }
  }
});
```

#### 创建固定深度 (@D) 条目

```typescript
const result = await ST_API.worldBook.createEntry({
  name: "参考用main_world",
  entry: {
    name: "系统规则",
    key: ["语气", "冷酷"],
    activationMode: "always",
    secondaryKey: ["强制"],
    selectiveLogic: "andAll",
    content: "请始终保持冷酷的语气。",
    position: "fixed",
    role: "system", // 映射为 @D 系统
    depth: 4 // 深度
  }
});
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
  },
  "ok": true
}
```
