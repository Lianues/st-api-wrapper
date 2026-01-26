# worldBook.delete

## 描述

删除指定名称和作用域的世界书。

> 重要说明：在 SillyTavern 中，`scope: 'chat' | 'character'` 的“世界书”是**绑定关系**。  
> 因此 delete 默认行为是“解绑”，不会删除全局世界书文件；如需同时删除文件，请使用 `deleteGlobalFile: true`。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 世界书名称。 |
| scope | WorldBookScope | 否 | 作用域。 |
| deleteGlobalFile | boolean | 否 | 仅对 `scope: 'chat' | 'character'` 生效：是否在解绑后同时删除对应的全局世界书文件。默认 `false`。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.worldBook.delete({
  name: "Temporary_Lore",
  scope: "global"
});

if (result.ok) {
  console.log("世界书已永久删除");
}
```

#### 仅解绑当前聊天的世界书（不删除文件）

```typescript
// 兼容写法：name 传 "Current Chat" 表示“当前聊天绑定的那本”
await ST_API.worldBook.delete({
  name: "Current Chat",
  scope: "chat"
});
```

#### 解绑并删除文件（chat/character）

```typescript
await ST_API.worldBook.delete({
  name: "Current Chat",
  scope: "chat",
  deleteGlobalFile: true
});
```

### 响应示例

```json
{
  "ok": true
}
```
