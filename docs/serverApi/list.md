# serverApi.list

## 描述

列出通过 `serverApi.register` 动态注册过的端点（仅包含本次页面生命周期内注册的记录）。

## 输入

无

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| endpoints | array | 已注册端点列表（与 `serverApi.register` 输出结构相同）。 |

---

## 示例

```typescript
const r = await ST_API.serverApi.list();
console.table(r.endpoints.map(e => ({ fullName: e.fullName, url: e.url, method: e.method })));
```

