# variables.add

## 描述

对指定变量进行加法操作（数值增加或字符串拼接）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 变量名。 |
| value | any | 是 | 要增加的值（数值或字符串）。 |
| scope | string | 否 | 作用域。可选值：`local` (默认), `global`。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 数值增加
await ST_API.variables.add({ name: 'coins', value: 10 });

// 字符串拼接
await ST_API.variables.add({ name: 'log', value: '\nnew line' });
```

### 响应示例

```json
{
  "ok": true
}
```
