# worldBook.list

## 描述

列出当前环境中可用的所有世界书。支持按作用域（全局、角色、聊天）进行筛选。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| scope | WorldBookScope | 否 | 作用域筛选。可选：`global`, `character`, `chat`。如果不传则列出所有。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| worldBooks | object[] | 书籍简要信息列表。 |

### 书籍对象结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 书名。 |
| scope | string | 作用域。 |
| ownerId | string? | 归属 ID（角色 ID 或 聊天 ID）。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 列出所有世界书
const result = await ST_API.worldBook.list();
console.log(`总计找到 ${result.worldBooks.length} 本书`);

// 过滤出全局书
const globalBooks = result.worldBooks.filter(b => b.scope === 'global');
console.log("全局书列表:", globalBooks.map(b => b.name));
```

### 响应示例

```json
{
  "worldBooks": [
    {
      "name": "Skyrim_Lore",
      "scope": "global"
    },
    {
      "name": "Cyberpunk_City",
      "scope": "global"
    },
    {
      "name": "Seraphina",
      "scope": "character",
      "ownerId": "5"
    },
    {
      "name": "Current Chat",
      "scope": "chat",
      "ownerId": "chat-2023-10-27"
    }
  ]
}
```
