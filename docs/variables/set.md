# variables.set

## 描述

设置指定作用域下的变量值。设置成功后会触发 UI 和设置的自动保存。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 变量名。 |
| value | any | 是 | 要设置的值。 |
| scope | string | 否 | 作用域。可选值：`local` (默认), `global`。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否设置成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 设置局部变量
await ST_API.variables.set({ name: 'score', value: 100 });

// 设置全局变量
await ST_API.variables.set({ name: 'config', value: { color: 'red' }, scope: 'global' });
```

### 响应示例

```json
{
  "ok": true
}
```
