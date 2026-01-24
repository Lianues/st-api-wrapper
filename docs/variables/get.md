# variables.get

## 描述

获取指定作用域下的**单个变量值**。

> 如需获取某个作用域下的全部变量，请使用 `variables.list()`。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 变量名。 |
| scope | string | 否 | 作用域。可选值：`local` (当前聊天, 默认), `global` (全局)。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| value | any | 变量当前值。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 获取当前聊天的局部变量 'myVar'
const result = await ST_API.variables.get({ name: 'myVar' });
console.log(result.value);
```

### 响应示例

```json
{
  "value": "hello world"
}
```
