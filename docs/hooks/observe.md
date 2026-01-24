# hooks 观察（observe）

## 能做什么

把“生成过程”和“UI 等待态”包装成可订阅事件：

- 生成生命周期：`GENERATION_STARTED / GENERATION_STOPPED / GENERATION_ENDED`
- 流式 token：`STREAM_TOKEN_RECEIVED`
- 等待态按钮（Stop）：`#mes_stop` 显示/隐藏（通过 MutationObserver 观察）

---

## 安装示例

```typescript
await ST_API.hooks.install({
  id: 'myHooks',
  observe: {
    targets: ['generationLifecycle', 'streamTokens', 'stopButtonVisibility'],
    blockGenerationOnStart: false,
    emitInitialStopButtonState: true,
  },
  broadcast: { target: 'both' },
});
```

---

## 广播事件名（默认）

### 生成生命周期

- ST：
  - `st_api_wrapper:generation.started`
  - `st_api_wrapper:generation.stopped`
  - `st_api_wrapper:generation.ended`
- DOM：
  - `st-api-wrapper:generation.started`
  - `st-api-wrapper:generation.stopped`
  - `st-api-wrapper:generation.ended`

### 流式 token

- ST：`st_api_wrapper:generation.streamToken`
- DOM：`st-api-wrapper:generation.streamToken`

payload：`{ delta, full }`（full 为 hooks 层累计文本）

### Stop 按钮显示/隐藏

- ST：
  - `st_api_wrapper:ui.stopButtonShown`
  - `st_api_wrapper:ui.stopButtonHidden`
- DOM：
  - `st-api-wrapper:ui.stopButtonShown`
  - `st-api-wrapper:ui.stopButtonHidden`

---

## 监听示例（DOM）

```typescript
window.addEventListener('st-api-wrapper:generation.started', (e: any) => {
  console.log('generation started', e.detail);
});

window.addEventListener('st-api-wrapper:generation.streamToken', (e: any) => {
  const { delta, full } = e.detail;
  // delta: 本次新增 token
  // full: 累计文本
  console.log(delta);
});

window.addEventListener('st-api-wrapper:ui.stopButtonShown', (e: any) => {
  console.log('stop button shown', e.detail);
});
```

---

## 可选：兜底阻断“任何生成开始”

如果你想要“无论用户从哪里触发生成，都不要让它真正跑起来”，可以开启：`observe.blockGenerationOnStart=true`。
它会在 `GENERATION_STARTED` 时立即调用 `ctx.stopGeneration()`（属于强力兜底）。

> 这可能带来轻微副作用（例如 UI 闪一下、某些扩展期望生成开始事件后还有后续），建议只在确实需要全局接管时使用。

