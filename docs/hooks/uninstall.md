# hooks.uninstall

## 描述

卸载指定 `id` 的 hooks，并清理其绑定的所有监听/观察（DOM 事件、ST eventSource 监听、MutationObserver 等）。

---

## 输入（UninstallHooksInput）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 安装时使用的 hooks ID。 |

---

## 输出（UninstallHooksOutput）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否卸载成功（找不到 id 会返回 false）。 |

---

## 示例

```typescript
await ST_API.hooks.uninstall({ id: 'myHooks' });
```

