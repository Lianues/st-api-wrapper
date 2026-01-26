# command.run

## 描述

调用后端 **Server Plugin `command-exec`** 执行命令。支持两种模式：

- **direct 模式**：传 `command + args`，直接 spawn（不依赖 shell）
- **script 模式**：传 `script`，由后端按 `terminal` 选择终端执行（Windows 默认 PowerShell；Linux/macOS 默认 `SHELL`/`bash`）

> 该 API 依赖后端存在 `/api/plugins/command-exec/run`。若未安装 server plugin，会请求失败（通常 404）。  
> 目前后端默认启用 **命令权限配置**（默认更安全）。如果你没配置白名单/目录限制（例如 `allowedCommands` / `allowedCwdRoots`），`run` 可能会被 **403** 拒绝。权限配置见：`docs/command/sandbox.md`。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| command | string | 否 | direct 模式的可执行文件/命令名（`script` 为空时必填）。 |
| args | string[] | 否 | direct 模式参数数组。 |
| script | string | 否 | script 模式脚本文本（优先级高于 command）。 |
| terminal | string | 否 | script 模式终端类型：`auto`/`powershell`/`pwsh`/`cmd`/`bash`/`sh`/`zsh`/`fish`/`custom`。 |
| terminalCommand | string | 否 | script 模式：直接指定终端可执行文件路径/命令。 |
| terminalArgs | string[] | 否 | script 模式：终端参数模板数组，支持 `{{script}}` 占位符。 |
| stdin | string | 否 | 传入 stdin（可选）。 |
| cwd | string | 否 | 工作目录（可选）。 |
| timeoutMs | number | 否 | 超时毫秒（可选）。超时后后端会尝试终止子进程。 |
| env | object | 否 | 额外环境变量（可选；会覆盖后端已有 env 同名字段）。 |
| outputEncoding | string | 否 | stdout/stderr 解码方式：`auto`(默认) / `gbk`(Windows 常用) / `utf8` / `utf16le` 等。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | `exitCode===0 && !timedOut` 时为 true。 |
| exitCode | number \| null | 进程退出码。 |
| signal | string \| null | 终止信号（平台相关，可能为空）。 |
| stdout | string | 标准输出。 |
| stderr | string | 标准错误。 |
| timedOut | boolean | 是否超时。 |
| durationMs | number | 执行耗时（毫秒）。 |
| error | string | （可选）spawn/执行错误信息。 |
| mode | string | `direct` 或 `script`。 |
| command/args | - | direct 模式回显。 |
| script/terminal | - | script 模式回显（包含最终使用的终端 command 与 args）。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// direct：执行 python（等价于 python hello.py --name ST）
const r1 = await ST_API.command.run({
  command: 'python',
  args: ['C:\\\\scripts\\\\hello.py', '--name', 'ST'],
  timeoutMs: 10_000,
});
console.log(r1.mode, r1.exitCode, r1.stdout);

// script：Windows 强制 PowerShell 执行一段脚本
const r2 = await ST_API.command.run({
  script: 'Write-Output \"hello\"; $PSVersionTable.PSVersion.ToString()',
  terminal: 'powershell',
});
console.log(r2.mode, r2.stdout);

// script：Linux/macOS 执行 bash
const r3 = await ST_API.command.run({
  script: 'echo hello && uname -a',
  terminal: 'bash',
});
console.log(r3.mode, r3.stdout);
```

---

## Windows 常见坑（cmd/.bat/.cmd 路径、空格、常驻进程）

### 1) **优先用 direct 模式** 执行 `.cmd/.bat`（避免引号被转义成 `\\\"`）

当你用 `script + terminal:'cmd'` 时，如果 `script` 里包含双引号（例如 `call "xxx.cmd"`），底层会把引号转义成 `\\\"`，`cmd` 会把它当成普通字符，从而报：

- `\"xxx.cmd\" 不是内部或外部命令...`

因此建议用 **direct 模式**，把参数拆成数组交给后端执行，避免在 `script` 里写引号：

```typescript
// 运行当前目录下的 cmd（文件名有空格/中文也可以）
const r = await ST_API.command.run({
  command: 'cmd.exe',
  args: ['/d', '/s', '/c', 'call', '新建 文本文档.cmd'],
  cwd: 'F:\\\\111\\\\gravity - Copy (1)',
  // Windows 中文输出建议：gbk（如果你发现输出里有很多 `�`）
  outputEncoding: 'gbk',
  timeoutMs: 10 * 60 * 1000,
});
console.log(r.exitCode, r.stdout, r.stderr);
```

### 2) 你的脚本是“监听常驻”的：不要用同步等待 stdout

监听型脚本不会退出，所以 `await ST_API.command.run(...)` 会一直等待直到超时。此时更推荐 **后台启动**（打开新窗口 / 让它自己跑）：

```typescript
// 后台启动：start 会立即返回（拿不到脚本输出）
await ST_API.command.run({
  terminal: 'cmd',
  script: 'start \"\" \"新建 文本文档.cmd\"',
  cwd: 'F:\\\\111\\\\gravity - Copy (1)',
  outputEncoding: 'gbk',
  timeoutMs: 30_000,
});
```

### 3) 想让窗口“不要闪退”（便于观察日志）：用 PowerShell + cmd /k

下面这个写法会：

- 用 PowerShell `Start-Process` 启动一个新的 cmd 窗口
- `keepOpen=true` 时使用 `/k`，窗口会保持不关闭
- 返回新窗口进程 PID（stdout）

```typescript
const keepOpen = true;
const cmdFlag = keepOpen ? '/k' : '/c';
const wd = 'F:\\\\111\\\\gravity - Copy (1)';

const ps =
  `Start-Process -FilePath 'cmd.exe' -WorkingDirectory '${wd}' ` +
  `-ArgumentList @('/d','/s','${cmdFlag}','call','\"新建 文本文档.cmd\"') ` +
  `-WindowStyle Normal -PassThru | ForEach-Object { $_.Id }`;

const r = await ST_API.command.run({
  command: 'powershell',
  args: ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', ps],
  // PowerShell 有时会输出 UTF-16LE，auto 会自动尝试；你也可以手动指定
  outputEncoding: 'auto',
  timeoutMs: 30_000,
});

console.log('pid=', r.stdout.trim());
console.log('stderr=', r.stderr);
```

### 4) `dir` 输出中文乱码？

这通常是 **cmd 的代码页**导致的显示乱码，不影响文件实际存在与执行。你可以：

- 用 PowerShell 来列目录（输出更友好），或
- 在 cmd 里先 `chcp 65001` 再 `dir`（仅影响显示）。

### 响应示例（direct）

```json
{
  "ok": true,
  "exitCode": 0,
  "signal": null,
  "stdout": "Hello\\n",
  "stderr": "",
  "timedOut": false,
  "durationMs": 12,
  "mode": "direct",
  "command": "python",
  "args": ["C:\\\\scripts\\\\hello.py", "--name", "ST"],
  "cwd": null
}
```

