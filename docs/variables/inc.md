# variables.inc

## 描述

对指定数值变量进行自增操作（+1）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 变量名。 |
| scope | string | 否 | 作用域。可选值：`local` (默认), `global`。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 局部变量自增
await ST_API.variables.inc({ name: 'counter' });
```

### 响应示例

```json
{
  "ok": true
}
```
