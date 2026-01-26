# serverApi.unregister

## 描述

注销一个通过 `serverApi.register` 动态注册过的端点（从 `ST_API` registry 中移除）。

> 仅影响前端的 `ST_API` 运行时注册表，不会删除后端路由。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| fullName | string | 否 | 完整名 `namespace.endpoint`（优先）。 |
| namespace | string | 否 | 与 name 组合使用。 |
| name | string | 否 | 与 namespace 组合使用。 |

> 必须提供 `fullName` 或 `namespace + name`。

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| fullName | string | 实际注销的完整名。 |
| removed | boolean | 是否真的移除了（false 表示该端点不存在）。 |

---

## 示例

```typescript
await ST_API.serverApi.register({
  namespace: 'tmp',
  name: 'ping',
  url: '/api/ping',
  method: 'POST',
});

const u = await ST_API.serverApi.unregister({ fullName: 'tmp.ping' });
console.log(u.removed);
```

