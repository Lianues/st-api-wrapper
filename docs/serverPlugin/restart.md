# serverPlugin.restart

## 描述

触发酒馆后端重启，用于在安装/删除 Server Plugin 后快速生效。

> 该 API 依赖后端存在 `/api/plugins/server-plugin-manager/restart`。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| mode | string | 否 | `respawn`（尽力自拉起新进程）或 `exit`（仅退出旧进程），默认 `respawn`。 |
| delayMs | number | 否 | 重启延迟（毫秒，默认 `800`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功调度重启。 |
| restart | object | `scheduled/mode/delayMs`。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
await ST_API.serverPlugin.restart({ mode: 'respawn', delayMs: 800 });
```

