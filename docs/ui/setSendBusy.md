# ui.setSendBusy

## 描述

将发送按钮（`#send_but`）切换为“等待态”显示，但**不会阻断**酒馆原生发送/生成逻辑。

- `busy=true`：把发送按钮的图标临时替换为 spinner（`fa-solid fa-spinner fa-spin`）
- `busy=false`：恢复原图标

该 API 内部使用 `owner` 做引用计数：多个插件同时 busy 时不会互相抢恢复；只有所有 owner 都 `busy=false` 后才会恢复。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| owner | string | 是 | 调用方标识（建议使用 `插件名` 或 `插件名.功能名`）。 |
| busy | boolean | 是 | 是否进入等待态。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | true | 是否成功。 |
| busy | boolean | 当前整体是否处于等待态（任意 owner busy 即为 true）。 |
| owners | string[] | 当前持有 busy 的 owner 列表。 |

---

## 示例

### 1）手动切换等待态

```typescript
await ST_API.ui.setSendBusy({ owner: 'my-plugin', busy: true });
try {
  // ... 执行你的工作 ...
} finally {
  await ST_API.ui.setSendBusy({ owner: 'my-plugin', busy: false });
}
```

### 2）配合 hooks：监听发送但不阻断 + 等待态

```typescript
// 1) 安装 hooks：仅监听，不阻断
await ST_API.hooks.install({
  id: 'myHooks',
  intercept: {
    targets: ['sendButton', 'sendEnter'],
    block: { sendButton: false, sendEnter: false },
    onlyWhenSendOnEnter: true,
  },
  broadcast: { target: 'dom' },
});

// 2) 监听拦截事件：进入等待态 -> 触发你的后台插件 -> 恢复
window.addEventListener('st-api-wrapper:intercept', async (e: any) => {
  const p = e.detail;
  if (p.target !== 'sendButton' && p.target !== 'sendEnter') return;

  await ST_API.ui.setSendBusy({ owner: 'my-plugin', busy: true });
  try {
    // 这里替换成你自己的后台插件事件/异步任务
    await (window as any).myPlugin?.doWork?.();
  } finally {
    await ST_API.ui.setSendBusy({ owner: 'my-plugin', busy: false });
  }
});
```

> 注意：这里 `block=false`，酒馆原生发送仍会执行；你的逻辑应避免与原生流程产生冲突（例如只做 UI/记录/旁路任务）。如果你要“完全接管发送”，请把 `block.sendButton=true`，并参考 `hooks.bypassOnce` 的用法避免递归。

### 3）配合 hooks：阻断酒馆默认发送/生成 + 等待态 + 自己写入消息

当你希望用户点击“发送”后 **不走酒馆默认 `sendTextareaMessage() -> Generate()`**，而是交给你自己的后台插件流程时，可以把 `block=true`，并自行写入聊天消息：

```typescript
// 1) 安装 hooks：拦截并阻断 send
await ST_API.hooks.install({
  id: 'mySendHook',
  intercept: {
    targets: ['sendButton', 'sendEnter'],
    block: { sendButton: true, sendEnter: true },
    onlyWhenSendOnEnter: true,
  },
  broadcast: { target: 'dom' },
});

// 2) 监听拦截事件：读取输入 -> 写入 user 消息 -> 调用插件 -> 写入 model 消息
let running = false;
window.addEventListener('st-api-wrapper:intercept', async (e: any) => {
  const p = e.detail;
  if (p.target !== 'sendButton' && p.target !== 'sendEnter') return;
  if (running) return;
  running = true;

  try {
    const ta = document.getElementById('send_textarea') as HTMLTextAreaElement | null;
    const text = String(ta?.value ?? '');
    if (!text.trim()) return;

    // 清空输入框并保持焦点（因为默认 click 处理被阻断）
    if (ta) {
      ta.value = '';
      ta.focus();
    }

    await ST_API.ui.setSendBusy({ owner: 'my-plugin', busy: true });
    try {
      // 1) 自己写入用户消息（不触发酒馆默认生成）
      await ST_API.chatHistory.create({ role: 'user', content: text });

      // 2) 调用你的后台插件（示例）
      const reply = await (window as any).myPlugin?.doWork?.(text);

      // 3) 自己写入模型回复
      if (reply) {
        await ST_API.chatHistory.create({ role: 'model', content: String(reply) });
      }
    } finally {
      await ST_API.ui.setSendBusy({ owner: 'my-plugin', busy: false });
    }
  } finally {
    running = false;
  }
});
```

> 注意：当 `block=true` 时，酒馆默认发送/生成流程不会执行，因此“附件/继续发送/Continue-on-send/斜杠命令”等逻辑也不会自动跑。你可以按需求自行补齐这些行为，或只在特定条件下启用拦截。

