# hooks.install

## 描述

安装一套 hooks（拦截/观察），并开始广播事件。

建议先阅读：
- `docs/hooks/README.md`
- `docs/hooks/intercept.md`
- `docs/hooks/observe.md`

---

## 输入（InstallHooksInput）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 唯一 ID（用于 uninstall/bypassOnce）。 |
| intercept | object? | 拦截配置（见下文“intercept 配置清单”）。 |
| observe | object? | 观察配置（见下文“observe 配置清单”）。 |
| broadcast | object? | 广播配置（见下文“broadcast 配置清单”）。 |

---

## intercept 配置清单（HookInterceptOptions）

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| targets | string[] | `['sendButton','sendEnter','regenerate','continue','impersonate','stopButton']` | 要拦截哪些入口（见下表“HookInterceptTarget 可选值”）。 |
| block | boolean \| object | `true` | 是否阻止默认行为：\n- `true/false`：全局开关\n- object：按 target 细粒度控制（未写的 target 默认视为 `true`） |
| onlyWhenSendOnEnter | boolean | `true` | 仅对 `sendEnter` 生效：\n- `true`：只有酒馆设置为“按 Enter 发送”时才拦截\n- `false`：只要按 Enter 就拦截 |

### HookInterceptTarget 可选值（targets）

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

## observe 配置清单（HookObserveOptions）

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| targets | string[] | `['generationLifecycle','streamTokens','stopButtonVisibility']` | 要观察哪些事件源（见下表“HookObserveTarget 可选值”）。 |
| blockGenerationOnStart | boolean | `false` | 强力兜底：在 `GENERATION_STARTED` 时立即 `stopGeneration()`，用于“全局接管生成”。 |
| emitInitialStopButtonState | boolean | `true` | 安装后是否立刻广播一次 stop 按钮当前显示状态。 |

### HookObserveTarget 可选值（targets）

| target | 来源 | 说明 |
| --- | --- | --- |
| generationLifecycle | ST eventSource | 转发 `GENERATION_STARTED/STOPPED/ENDED`。 |
| streamTokens | ST eventSource | 转发 `STREAM_TOKEN_RECEIVED`（delta/full）。 |
| stopButtonVisibility | DOM 观察 | 观察 `#mes_stop` 显示/隐藏，广播 `ui.stopButtonShown/Hidden`。 |

---

## broadcast 配置清单（HookBroadcastOptions）

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| target | `'st' \| 'dom' \| 'both'` | `'both'` | 广播到哪里：\n- `st`：`ctx.eventSource.emit(...)`\n- `dom`：`window.dispatchEvent(CustomEvent)`\n- `both`：两者都发 |
| stPrefix | string | `'st_api_wrapper'` | ST 事件名前缀（最终事件名为 `${stPrefix}:<suffix>`）。 |
| domPrefix | string | `'st-api-wrapper'` | DOM 事件名前缀（最终事件名为 `${domPrefix}:<suffix>`）。 |

---

## 输出（InstallHooksOutput）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 注册的 ID。 |
| ok | true | 是否成功。 |

---

## 示例

```typescript
await ST_API.hooks.install({
  id: 'myHooks',
  intercept: { block: true },
  observe: { targets: ['generationLifecycle', 'stopButtonVisibility'] },
  broadcast: { target: 'both' },
});
```

