# worldbook.delete

## 描述

删除指定名称和作用域的世界书。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 世界书名称。 |
| scope | WorldBookScope | 否 | 作用域。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.worldbook.delete({
  name: "Temporary_Lore",
  scope: "global"
});

if (result.ok) {
  console.log("世界书已永久删除");
}
```

### 响应示例

```json
{
  "ok": true
}
```
