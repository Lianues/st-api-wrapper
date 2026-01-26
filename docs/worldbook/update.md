# worldBook.update

## 描述

更新世界书。支持对书籍进行重命名，或使用整理后的立体结构数组覆盖整本书的所有条目。

> 重要说明：在 SillyTavern 中，`scope: 'chat' | 'character'` 表示“更新当前聊天/当前角色绑定的那个全局世界书文件”。  
> - 覆盖 `entries`：实际会写入对应的全局世界书文件。  
> - `newName` 重命名：会重命名全局世界书文件，并同步更新聊天/角色的绑定指向。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 当前书名。 |
| scope | WorldBookScope | 否 | 作用域。`chat/character` 表示操作“当前聊天/角色绑定的全局世界书”。 |
| newName | string | 否 | 新的书名（如果需要重命名）。 |
| entries | WorldBookEntry[] | 否 | 如果提供，将用此数组全量覆盖书中的所有条目。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| name | string | 书籍当前的最新名称。 |

---

## 示例

### 代码示例 (TypeScript)

#### 仅覆盖条目

```typescript
const result = await ST_API.worldBook.update({
  name: "参考用main_world",
  entries: [
    {
      index: 0,
      name: "更新后的都市",
      key: ["都市"],
      activationMode: "keyword",
      enabled: true,
      content: "内容已被全量覆盖...",
      position: "beforeChar",
      order: 100,
      depth: 4,
      role: null,
      caseSensitive: null,
      excludeRecursion: false,
      preventRecursion: false,
      probability: 100,
      other: {}
    }
  ]
});
```

#### 仅重命名

```typescript
await ST_API.worldBook.update({
  name: "Old_Name",
  newName: "New_Beautiful_Name"
});
```

#### 更新当前聊天绑定的世界书（chat）

```typescript
// 兼容写法：name 传 "Current Chat" 表示“当前聊天绑定的那本”
await ST_API.worldBook.update({
  name: "Current Chat",
  scope: "chat",
  newName: "Chat_Lore_Renamed"
});
```

### 响应示例

```json
{
  "ok": true,
  "name": "参考用main_world"
}
```
