# hooks 拦截（intercept）

## 能做什么

拦截常见入口，使用户的操作不再直接触发酒馆原生逻辑，而是改为**广播一个事件**给你处理：

- 发送按钮：`#send_but`
- 左侧菜单（三横线按钮）：`#options_button`
- 左侧扩展菜单（魔法棒按钮）：`#extensionsMenuButton`
- Enter 发送：`#send_textarea` 的 Enter（可选）
- 再生：`#option_regenerate`
- 继续：`#option_continue`、`#mes_continue`
- 扮演：`#mes_impersonate`
- 停止按钮：`#mes_stop` / `.mes_stop`

当 `block=true` 时，会在捕获阶段调用 `preventDefault + stopImmediatePropagation`，从而阻止 jQuery 的默认 click 处理继续执行。

---

## targets 清单（HookInterceptTarget）

| target | 对应 DOM | 说明 |
| --- | --- | --- |
| sendButton | `#send_but` | 纸飞机“发送”按钮。 |
| sendEnter | `#send_textarea` (Enter) | 输入框按 Enter 发送（可选）。 |
| optionsButton | `#options_button` | 左侧三横线“菜单”按钮。 |
| extensionsMenuButton | `#extensionsMenuButton` | 左侧魔法棒“扩展菜单”按钮。 |
| regenerate | `#option_regenerate` | 再生按钮。 |
| continue | `#option_continue`、`#mes_continue` | 继续按钮（含不同入口）。 |
| impersonate | `#mes_impersonate` | 扮演/代写按钮。 |
| stopButton | `#mes_stop` / `.mes_stop` | 停止按钮（等待态/Abort request）。 |

---

## 安装示例

```typescript
await ST_API.hooks.install({
  id: 'myHooks',
  intercept: {
    // 推荐：对“生成相关入口”阻止默认行为，但菜单仍正常打开
    block: {
      sendButton: true,
      sendEnter: true,
      regenerate: true,
      continue: true,
      impersonate: true,
      stopButton: true,
      optionsButton: false,
      extensionsMenuButton: false,
    },
    targets: ['sendButton', 'sendEnter', 'optionsButton', 'extensionsMenuButton', 'regenerate', 'continue', 'impersonate', 'stopButton'],
    onlyWhenSendOnEnter: true,
  },
  broadcast: { target: 'both' },
});
```

---

## 只监听不阻断（block=false）

如果你希望 **仍然走酒馆原生逻辑**（例如正常发送/生成），同时又想“监听到用户点击/按键”来做额外工作流（例如 UI 等待态、旁路调用后台插件），可以把对应 target 的 `block` 设为 `false`：

```typescript
await ST_API.hooks.install({
  id: 'myHooks',
  intercept: {
    targets: ['sendButton', 'sendEnter'],
    block: { sendButton: false, sendEnter: false },
    onlyWhenSendOnEnter: true,
  },
  broadcast: { target: 'both' },
});
```

说明：
- 依然会广播 `intercept` 事件
- payload 里的 `blocked` 会是 `false`
- 酒馆原生 click/Enter 逻辑不会被 `preventDefault/stopImmediatePropagation` 阻断

---

## 广播事件

### 事件名（默认）

- ST：`st_api_wrapper:intercept`
- DOM：`st-api-wrapper:intercept`

### payload（HookInterceptPayload）

- `id`: 你的 hooks 实例 ID
- `timestamp`: 时间戳
- `source`: `'click' | 'keydown'`
- `target`: `'sendButton' | 'sendEnter' | 'optionsButton' | 'extensionsMenuButton' | 'regenerate' | 'continue' | 'impersonate' | 'stopButton'`
- `selector`: 命中的选择器（例如 `#send_but`）
- `blocked`: 本次是否阻止了默认行为

---

## 典型工作流：拦截 send_but → 改为你自己的生成

```typescript
// 监听拦截（DOM）
window.addEventListener('st-api-wrapper:intercept', async (e: any) => {
  const p = e.detail;
  if (p.target !== 'sendButton') return;

  // 这里替换成你自己的工作流，例如：
  // 1) 读取输入框内容
  // 2) 自己构造 prompt / 调用外部服务
  // 3) 再用 ST_API 写回消息或展示 UI
  console.log('intercept send button:', p);
});
```

---

## bypassOnce：放行一次默认行为（避免递归）

当你想“程序触发一次默认 click”时，先放行一次，再触发 click：

```typescript
await ST_API.hooks.bypassOnce({ id: 'myHooks', target: 'sendButton' });
document.getElementById('send_but')?.click();
```

