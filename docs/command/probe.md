# command.probe

## 描述

探测酒馆后端 **Server Plugin `command-exec`** 是否可用，并返回：

- 后端平台信息（`platform` / Node 版本）
- `script` 模式下的**默认终端选择**（Windows 默认 PowerShell；Linux/macOS 优先 `SHELL`，否则 `bash`）
- （可选）后端环境变量（默认返回常用子集）

> 该 API 依赖后端存在 `/api/plugins/command-exec/*`。若未安装 server plugin，会请求失败（通常 404）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| includeEnv | boolean | 否 | 是否返回 `env`（默认 `false`）。 |
| includeEnvAll | boolean | 否 | `includeEnv=true` 时，是否返回全量 env（默认 `false`，仅返回常用子集）。 |
| terminal | string | 否 | 预览 `script` 模式使用的终端类型（例如 `powershell`/`bash`/`sh`/`cmd`/`pwsh`/`custom`/`auto`）。 |
| terminalCommand | string | 否 | 直接指定终端可执行文件路径/命令（优先级高于 terminal）。 |
| terminalArgs | string[] | 否 | 终端参数模板数组，支持 `{{script}}` 占位符。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| plugin | object | 插件信息（`id/name/description`）。 |
| platform | string | Node 平台（例如 `win32` / `linux`）。 |
| node | object | Node 信息（例如 `version`）。 |
| defaultTerminal | object | 后端自动选择的默认终端（script 模式）。 |
| terminal | object | 按输入解析后的终端（script 模式）。 |
| env | object | （可选）环境变量映射表。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 探测默认终端选择
const a = await ST_API.command.probe();
console.log(a.platform, a.defaultTerminal);

// 预览：强制使用 bash
const b = await ST_API.command.probe({ terminal: 'bash' });
console.log(b.terminal);

// 预览：自定义终端命令（示例：PowerShell 7 的 pwsh）
const c = await ST_API.command.probe({
  terminal: 'pwsh',
  terminalCommand: 'pwsh',
});
console.log(c.terminal);
```

### 响应示例

```json
{
  "ok": true,
  "plugin": {
    "id": "command-exec",
    "name": "Command Exec",
    "description": "Execute backend commands via SillyTavern server plugin."
  },
  "platform": "win32",
  "node": { "version": "v20.11.0" },
  "defaultTerminal": {
    "type": "powershell",
    "command": "powershell",
    "argsTemplate": ["-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-Command","{{script}}"],
    "source": "auto.win32"
  },
  "terminal": {
    "type": "powershell",
    "command": "powershell",
    "argsTemplate": ["-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-Command","{{script}}"],
    "source": "auto.win32"
  }
}
```

