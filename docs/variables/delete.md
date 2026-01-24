# variables.delete

## 描述

删除指定作用域下的变量。删除后会触发 UI 和设置的自动刷新。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 变量名。 |
| scope | string | 否 | 作用域。可选值：`local` (默认), `global`。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否删除成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 删除局部变量
await ST_API.variables.delete({ name: 'tempVar' });

// 删除全局变量
await ST_API.variables.delete({ name: 'oldConfig', scope: 'global' });
```

### 响应示例

```json
{
  "ok": true
}
```
