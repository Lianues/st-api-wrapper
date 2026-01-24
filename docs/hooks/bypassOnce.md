# hooks.bypassOnce

## 描述

设置“放行一次默认行为”。

当你拦截了按钮点击后，某些场景下你可能想通过脚本触发一次酒馆原生逻辑（例如触发一次原生 send）。

为了避免你触发 click 时又被 hooks 拦截导致递归，需要先 `bypassOnce`。

注意：该放行只对**下一次**命中的拦截生效（命中后会自动清除）。

---

## 输入（BypassOnceInput）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | hooks ID。 |
| target | string | 放行哪个拦截点：`sendButton/sendEnter/regenerate/continue/impersonate/stopButton/any`。 |

---

## 输出（BypassOnceOutput）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否设置成功。 |

---

## 示例

```typescript
// 放行一次“发送按钮”
await ST_API.hooks.bypassOnce({ id: 'myHooks', target: 'sendButton' });
document.getElementById('send_but')?.click();
```

