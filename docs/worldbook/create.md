# worldBook.create

## 描述

创建一个新的世界书。支持创建空书，或者在创建时直接初始化条目列表。

> 重要说明：SillyTavern 中世界书文件只有 **全局（global）** 一种真实存储。  
> `scope: 'character' | 'chat'` 的含义是“将当前角色/当前聊天**绑定**到某个全局世界书名”，并不会把 entries 存到角色卡或聊天元数据里。  
> 因此当你用 `scope: 'character' | 'chat'` 调用 `create` 时：  
> 1) 会创建/覆盖同名的全局世界书文件；  
> 2) 再把当前角色/当前聊天绑定到这个世界书名。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 世界书名称。 |
| scope | WorldBookScope | 否 | 作用域：`global` (默认), `character`, `chat`。`character/chat` 表示“绑定当前角色/聊天到该全局世界书名”。 |
| entries | WorldBookEntry[] | 否 | 初始条目列表。如果不传则创建空书。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 创建的书名。 |
| ok | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

#### 创建带有初始条目的世界书

```typescript
const result = await ST_API.worldBook.create({
  name: "My_New_World",
  scope: "global",
  entries: [
    {
      index: 0,
      name: "起始地点",
      key: ["小镇", "起点"],
      secondaryKey: [],
      selectiveLogic: "andAny",
      activationMode: "keyword",
      enabled: true,
      role: null,
      caseSensitive: false,
      excludeRecursion: false,
      preventRecursion: false,
      probability: 100,
      order: 100,
      depth: 4,
      position: "beforeChar",
      content: "故事从小镇开始。",
      other: {}
    }
  ]
});

if (result.ok) {
  console.log("世界书创建成功并已初始化条目");
}
```

#### 创建空世界书

```typescript
const result = await ST_API.worldBook.create({
  name: "Empty_Book",
  scope: "global"
});
```

#### 创建并绑定到当前聊天（chat）

```typescript
// 创建/覆盖全局世界书 `My_Chat_Lore`，并将当前聊天绑定到它
await ST_API.worldBook.create({
  name: "My_Chat_Lore",
  scope: "chat",
  entries: [
    {
      index: 0,
      name: "起始地点",
      key: ["小镇", "起点"],
      secondaryKey: [],
      selectiveLogic: "andAny",
      activationMode: "keyword",
      enabled: true,
      role: null,
      caseSensitive: false,
      excludeRecursion: false,
      preventRecursion: false,
      probability: 100,
      order: 100,
      depth: 4,
      position: "beforeChar",
      content: "故事从小镇开始。",
      other: {}
    }
  ]
});
```

#### 创建并绑定到当前角色（character）

```typescript
// 创建/覆盖全局世界书 `My_Char_Lore`，并将当前角色绑定到它
await ST_API.worldBook.create({
  name: "My_Char_Lore",
  scope: "character",
  entries: [
    {
      index: 0,
      name: "起始地点",
      key: ["小镇", "起点"],
      secondaryKey: [],
      selectiveLogic: "andAny",
      activationMode: "keyword",
      enabled: true,
      role: null,
      caseSensitive: false,
      excludeRecursion: false,
      preventRecursion: false,
      probability: 100,
      order: 100,
      depth: 4,
      position: "beforeChar",
      content: "故事从小镇开始。",
      other: {}
    }
  ]
});
```

### 响应示例

```json
{
  "name": "My_New_World",
  "ok": true
}
```
