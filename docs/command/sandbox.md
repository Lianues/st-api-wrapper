# 后端命令权限配置

`command-exec` 默认是“全权限执行命令”，风险较高。本项目新增了一层 **命令权限配置**（白名单/目录限制/能力开关）来降低误操作风险，并提供前端 API + 设置面板来配置。

> 注意：这是逻辑层限制，不是 OS 级隔离。它无法阻止“被允许的命令”本身执行危险操作。

---

## 配置文件位置

后端会把配置持久化到：

- `SillyTavern/plugins/command-exec/sandbox.config.json`

（该文件会在你第一次通过面板保存配置后创建/更新。）

> 现在默认会在首次加载/首次读取配置时自动创建该文件；如果仍显示“未创建”，通常是插件目录不可写导致。

---

## 前端 API

### `ST_API.command.getSandbox()`

获取当前权限配置 + 默认值 + 文件信息。

### `ST_API.command.setSandbox(patch)`

更新权限配置（**部分字段 patch**），后端会做归一化并写入 `sandbox.config.json`。

---

## 关键配置项（默认更安全）

- `enabled`：是否启用权限限制。`false` 表示恢复“全权限”（高风险）
- `allowDirect`：是否允许 direct 模式（默认 `true`）
- `allowScript`：是否允许 script 模式（默认 `false`，高风险）
- `allowTerminalOverrides`：是否允许 `terminalCommand/terminalArgs`（默认 `false`，高风险）
- `allowEnvOverride`：是否允许 `env` 覆盖（默认 `false`，高风险）
- `denyShellCommands`：direct 模式是否禁止 shell 类命令（默认 `true`，会拦截 `cmd/powershell/pwsh/bash/sh/...`）
- `commandListMode`：direct 命令过滤模式：`allowlist`（白名单，默认）/ `denylist`（黑名单，更危险）
- `allowedCommands`：direct 模式命令白名单（仅 `allowlist` 生效；默认 `[]`，表示 **deny-all**）
- `blockedCommands`：direct 模式命令黑名单（仅 `denylist` 生效；默认会预置一批高危命令）
- `allowedCwdRoots`：允许的工作目录根路径（默认 `[process.cwd()]`）
- `maxTimeoutMs`：启用权限限制时会作为 **默认超时 + 上限**（默认 `600000`）
- `allowedEnvKeys`：允许覆盖的 env key 白名单（仅 `allowEnvOverride=true` 时生效；为空表示允许任意 key）

---

## 403 / 报错行为

当权限规则拒绝执行时，后端会返回 **403**。由于 `st-api-wrapper` 的 `postJson` 会对非 2xx 抛错，你需要用 `try/catch` 捕获：

```typescript
try {
  await ST_API.command.run({ command: 'python', args: ['--version'] });
} catch (e) {
  console.error('run 被权限规则拒绝：', e);
}
```

---

## 最小可用示例：只放行 direct + python

```typescript
// 1) 查看当前配置
const current = await ST_API.command.getSandbox();
console.log(current.config);

// 2) 放行 python（只允许 direct；script 仍然关闭）
await ST_API.command.setSandbox({
  enabled: true,
  allowDirect: true,
  allowScript: false,
  denyShellCommands: true,
  allowedCommands: ['python', 'python.exe'],
  allowedCwdRoots: ['F:\\\\111\\\\gravity - Copy (1)'],
  maxTimeoutMs: 10 * 60 * 1000,
});

// 3) direct 执行
const r = await ST_API.command.run({
  command: 'python',
  args: ['--version'],
  cwd: 'F:\\\\111\\\\gravity - Copy (1)',
  timeoutMs: 30_000,
  outputEncoding: 'gbk',
});
console.log(r.exitCode, r.stdout, r.stderr);
```

---

## 示例：黑名单模式（denylist）

黑名单模式的特点是“默认放行”，只拦截黑名单中命令，因此**比白名单更危险**。建议至少保留：

- `denyShellCommands=true`（避免 direct 直接跑 shell）
- `blockedCommands` 里保留 `cmd/powershell/bash/sudo/rm/...` 等高危项

```typescript
// 切换为黑名单模式：允许除黑名单外的 direct 命令
await ST_API.command.setSandbox({
  enabled: true,
  commandListMode: 'denylist',
  allowDirect: true,
  allowScript: false,
  denyShellCommands: true,
  // 不传也行：后端默认会预置一批高危命令到 blockedCommands
  // blockedCommands: ['cmd', 'powershell', 'rm', 'sudo', ...],
  allowedCwdRoots: ['F:\\\\111\\\\gravity - Copy (1)'],
});
```

