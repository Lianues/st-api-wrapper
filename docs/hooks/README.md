# hooks（拦截/广播/观察）

## 这是什么

`hooks` 模块用于把酒馆的“用户操作入口 / 生成过程 / UI 等待态”等事件包装成**可订阅**的事件，并且可以选择**拦截默认行为**（阻止酒馆原生生成流程），从而把工作流替换为你自己的流程。

它同时支持两种广播方式：

- ST 事件总线：`ctx.eventSource.emit('st_api_wrapper:...')`
- DOM 事件：`window.dispatchEvent(new CustomEvent('st-api-wrapper:...', { detail }))`

默认会 **两者都发**（可配置）。

---

## 配置清单（推荐从这里开始）

- `hooks.install` 的可配置对象都在：`docs/hooks/install.md`
- 入口拦截（send / 菜单 / 再生等）：`docs/hooks/intercept.md`
- 观察生成过程与等待态（#mes_stop）：`docs/hooks/observe.md`

---

## 快速开始

### 1）安装 hooks（拦截 + 观察）

```typescript
await ST_API.hooks.install({
  id: 'myHooks',
  intercept: {
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
  },
  observe: {
    targets: ['generationLifecycle', 'streamTokens', 'stopButtonVisibility'],
  },
  broadcast: { target: 'both' },
});
```

### 2）监听广播（DOM 方式）

```typescript
window.addEventListener('st-api-wrapper:intercept', (e: any) => {
  console.log('intercept', e.detail);
});
```

### 3）监听广播（ST eventSource 方式）

```typescript
const { eventSource } = window.SillyTavern.getContext();
eventSource.on('st_api_wrapper:intercept', (payload: any) => {
  console.log('intercept', payload);
});
```

### 4）卸载 hooks（清理所有监听/观察）

```typescript
await ST_API.hooks.uninstall({ id: 'myHooks' });
```

---

## 事件清单（suffix）

> 实际事件名会带前缀（默认 ST: `st_api_wrapper:`；DOM: `st-api-wrapper:`）。

- `intercept`：拦截到入口（send/regen/continue/impersonate/stop/enter）
- `generation.started` / `generation.stopped` / `generation.ended`
- `generation.streamToken`
- `ui.stopButtonShown` / `ui.stopButtonHidden`

详细字段与示例见：
- `docs/hooks/intercept.md`
- `docs/hooks/observe.md`
