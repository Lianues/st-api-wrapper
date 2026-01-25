# worldBook.deleteEntry

## 描述

从指定的世界书中删除一个条目。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 世界书名称。 |
| index | number | 是 | 条目索引（UID）。 |
| scope | WorldBookScope | 否 | 作用域：`global` (默认), `character`, `chat`。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功（如果条目本身不存在，也会返回 true）。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.worldBook.deleteEntry({
  name: "参考用main_world",
  index: 0
});

if (result.ok) {
  console.log("条目已删除");
}
```
