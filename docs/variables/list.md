# variables.list

## 描述

列出指定作用域下的所有变量映射表。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| scope | string | 否 | 作用域。可选值：`local` (当前聊天, 默认), `global` (全局)。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| variables | Record<string, any> | 所有变量映射表。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 获取所有全局变量
const allGlobals = await ST_API.variables.list({ scope: 'global' });
console.log(allGlobals.variables);
```

### 响应示例

```json
{
  "variables": {
    "var1": 123,
    "var2": "test"
  }
}
```

