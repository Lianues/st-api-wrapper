# command-exec + st-api-wrapper 集成步骤（本地）

本文档目标：让你把 **后端 Server Plugin（执行命令）** + **前端 `st-api-wrapper` 封装** 一起装到你自己的 SillyTavern 实例里，并能在前端通过 `ST_API.command.*` 调用。

> 注意：你要求暂时不删除 `st-api-wrapper/docs/python/`，所以旧的 python 文档仍保留；但现在推荐使用更通用的 `command` 接口。

---

## 0. 前置条件

- 你的 SillyTavern 运行目录可写（能放 `plugins/`、`extensions/`）

---

## 1. 安装后端 Server Plugin（command-exec）

把本仓库里的目录：

- `server-plugins/command-exec/`

复制到你的 SillyTavern 运行目录下：

- `SillyTavern/plugins/command-exec/`

最终应该存在文件：

- `SillyTavern/plugins/command-exec/index.mjs`

---

## 2. 启用 Server Plugins（config.yaml 在哪里？）

在你实际使用的 `config.yaml` 里启用：

- `enableServerPlugins: true`

酒馆启动时会打印类似：

- `Using config path: ./config.yaml`

这通常表示它实际读取的是 **SillyTavern 根目录（和 `server.js` 同级）下的 `config.yaml`**，也就是：

- `SillyTavern/config.yaml`

修改后需要 **重启酒馆** 才会加载插件。

---

## 3. （可选）配置 script 模式默认终端

`command.run({ script: ... })` 会按终端执行脚本。默认规则：

- Windows：默认 `powershell`
- Linux/macOS：优先使用 `SHELL`，否则默认 `bash`

你也可以通过环境变量指定默认终端（后端 Node 进程需要继承这些环境变量，设置后重启酒馆）：  

- `ST_TERMINAL`：例如 `powershell` / `pwsh` / `cmd` / `bash` / `sh` / `zsh` / `fish`
- `ST_TERMINAL_COMMAND`：直接指定终端命令/路径
- `ST_TERMINAL_ARGS`：JSON 数组字符串，支持 `{{script}}` 占位符  
  例如（PowerShell）：`["-NoProfile","-NonInteractive","-Command","{{script}}"]`

---

## 4. （重要）后端命令权限配置（默认更安全）

从现在开始，`command-exec` 默认启用 **命令权限配置**（白名单/目录限制/能力开关），避免“全权限任意执行”带来的风险。

默认策略要点：

- **enabled=true**（启用权限限制）
- **allowDirect=true**，**allowScript=false**（默认只允许 direct；script 是高风险，需要用户手动开启）
- **allowedCommands=[]（deny-all）**：不配置白名单时，`run` 会直接被 **403** 拒绝
- **allowedCwdRoots=[process.cwd()]**：`cwd` 必须在允许的根目录内

### 配置入口（推荐）

安装并启用 `st-api-wrapper` 后，在酒馆前端的扩展设置中会出现面板：

- `后端命令权限配置`

你可以在里面直接编辑：

- `allowedCommands`（命令白名单）
- `allowedCwdRoots`（目录白名单）
- 是否开启 `script/env/terminal overrides` 等危险能力（会弹出风险提示）

### 配置文件位置

配置会写入：

- `SillyTavern/plugins/command-exec/sandbox.config.json`

### 403 行为说明

权限规则拒绝时后端会返回 **403**，而 `st-api-wrapper` 会把非 2xx 当作异常抛出，所以你需要 `try/catch`。

更详细说明见：

- `st-api-wrapper/docs/command/sandbox.md`

---

## 5. 编译 `st-api-wrapper`（你自己执行）

```bash
cd "F:/111/酒馆插件教程/st-api-wrapper"
npm install
npm run build
```

---

## 6. 安装 `st-api-wrapper` 到 SillyTavern（两种常见方式）

### 方式 A：安装到 “所有用户 / third-party” 目录（便于开发）

把整个 `st-api-wrapper` 目录（包含 `manifest.json` 和 `dist/`）复制到：

- `SillyTavern/public/scripts/extensions/third-party/st-api-wrapper/`

### 方式 B：安装到某个用户的数据目录

把整个 `st-api-wrapper` 目录复制到：

- `SillyTavern/data/<user-handle>/extensions/st-api-wrapper/`

安装完成后重启（或在酒馆“管理扩展”里重载/启用该扩展）。

---

## 7. 最小验证（浏览器控制台）

1) 看 wrapper 是否已加载：

```js
window.ST_API?.listEndpoints?.()
```

2) 探测后端插件：

```js
await ST_API.command.probe()
```

3) 查找命令（例如 python / pwsh / bash）：

```js
await ST_API.command.which({ query: 'python' })
```

4) direct 模式执行：

```js
// 注意：如果你没配置白名单/目录限制，这里会被 403 拒绝
await ST_API.command.run({
  command: 'python',
  args: ['--version'],
})
```

5) script 模式执行（Windows 示例）：

```js
// 注意：默认 allowScript=false，会被 403；需要你在“后端命令权限配置”面板手动开启
await ST_API.command.run({
  terminal: 'powershell',
  script: 'Write-Output \"hello\"',
})
```

---

## 8. 你现在可用的封装 API（前端）

文档在：

- `st-api-wrapper/docs/command/probe.md`
- `st-api-wrapper/docs/command/run.md`
- `st-api-wrapper/docs/command/env.md`
- `st-api-wrapper/docs/command/which.md`
- `st-api-wrapper/docs/command/sandbox.md`

对应调用：

- `ST_API.command.probe(...)`
- `ST_API.command.run(...)`
- `ST_API.command.env(...)`
- `ST_API.command.which(...)`
- `ST_API.command.getSandbox()`
- `ST_API.command.setSandbox(patch)`

