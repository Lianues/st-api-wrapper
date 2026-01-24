# regexScript.delete

## 描述

删除指定的正则脚本。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 脚本 ID。 |
| scope | RegexScope | 否 | 作用域。如果不传，则按 全局->角色->预设 顺序查找第一个匹配 ID 的脚本进行删除。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.regexScript.delete({
  id: "bea00e49-03d4-4885-889e-34c3eaddbe2b"
});

if (result.success) {
  console.log("脚本已成功删除");
}
```

### 响应示例

```json
{
  "success": true
}
```
