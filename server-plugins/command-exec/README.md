# command-exec (SillyTavern Server Plugin)

这是一个 **酒馆后端 Server Plugin**，提供一组 HTTP API 用于在酒馆后端执行命令（支持按平台选择终端执行脚本）。

## 安装位置

将整个 `command-exec` 文件夹复制到你的酒馆运行目录下的：

- `SillyTavern/plugins/command-exec/`

最终应当存在文件：

- `SillyTavern/plugins/command-exec/index.mjs`

## 启用

在你实际使用的 `config.yaml` 中设置：

- `enableServerPlugins: true`

然后重启酒馆。

> 你可以从酒馆启动日志确认它实际读取的配置文件位置，例如看到：  
> `Using config path: ./config.yaml`  
> 这通常表示配置文件就在 **SillyTavern 根目录（和 `server.js` 同级）下的 `config.yaml`**。

## 端点

统一前缀：

- `/api/plugins/command-exec/*`

提供：

- `POST /probe`：探测后端平台/默认终端选择/（可选）env  
- `POST /env`：读取后端环境变量（默认子集，可选全量或指定 keys）  
- `POST /which`：查找某个命令位置（Windows 用 `where`，类 Unix 用 `which -a`）  
- `POST /run`：执行命令（两种模式：direct 或 script）  

### /run：两种模式

- **direct 模式**：传 `command` + `args`，直接 spawn 进程（不依赖 shell）
- **script 模式**：传 `script`，由后端按 `terminal` 选择终端执行（支持 Windows PowerShell / cmd，Linux/macOS bash/sh 等，也支持自定义）

### 输出编码（避免 Windows 中文乱码）

该插件会对 stdout/stderr 做 **自动解码**：

- 默认按 UTF-8 解码
- 在 Windows 上如果发现大量 `�`（replacement char），会尝试用 `gbk` 解码（依赖 SillyTavern 自带的 `iconv-lite`）
- 如果发现大量 `\u0000`（疑似 UTF-16LE），会尝试用 `utf16le` 解码

你也可以在 `/run` 请求体里显式传：

- `outputEncoding: "gbk" | "utf8" | "utf16le" | "auto" | ...`

### Windows 引号转义（\\\"）的小坑

如果你在前端写 `script` 时把双引号写成了 `\\\"`（常见于复制粘贴/不必要的转义），`cmd/powershell` 会把反斜杠当成普通字符导致命令失败。插件会对 Windows shells（cmd/powershell/pwsh）做一次轻量修正：把 `\\\"` 还原成 `"`。

### 终端选择（script 模式）

你可以通过三种方式指定终端：

1) 请求体传参（优先级最高）：
- `terminal`（例如 `powershell` / `bash` / `sh` / `cmd` / `pwsh` / `custom`）
- `terminalCommand`（直接指定可执行文件路径或命令名）
- `terminalArgs`（参数模板数组，支持 `{{script}}` 占位符）

2) 环境变量（后端默认值）：
- `ST_TERMINAL`
- `ST_TERMINAL_COMMAND`
- `ST_TERMINAL_ARGS`（JSON 数组字符串，例如 `["-NoProfile","-Command","{{script}}"]`）

3) 自动选择（未指定时）：
- Windows：默认 `powershell`
- Linux/macOS：优先使用 `SHELL`，否则默认 `bash`

> 注意：该插件默认不做安全限制（按你的当前需求）。用于生产环境前务必加白名单/鉴权/目录限制等。

