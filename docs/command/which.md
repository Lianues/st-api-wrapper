# command.which

## 描述

在后端查询某个命令在系统中的位置：

- Windows：调用 `where <query>`
- Linux/macOS：调用 `which -a <query>`

通常用来查找 `python` / `bash` / `pwsh` 等命令是否存在。

> 该 API 依赖后端存在 `/api/plugins/command-exec/which`。若未安装 server plugin，会请求失败（通常 404）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| query | string | 否 | 查询命令（默认 `python`）。 |
| timeoutMs | number | 否 | 超时毫秒（默认 `5000`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | `where/which` 是否成功。 |
| query | string | 实际查询的命令。 |
| command | string | 执行的系统命令描述（例如 `where` 或 `which -a`）。 |
| results | string[] | 路径列表（按行拆分并去重）。 |
| stdout | string | 原始 stdout。 |
| stderr | string | 原始 stderr。 |
| exitCode | number \| null | 退出码。 |
| timedOut | boolean | 是否超时。 |
| durationMs | number | 耗时。 |
| error | string | （可选）执行错误信息。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 查 python
const a = await ST_API.command.which({ query: 'python' });
console.log(a.results);

// 查 PowerShell 7（如果有）
const b = await ST_API.command.which({ query: 'pwsh' });
console.log(b.results);

// 查 bash
const c = await ST_API.command.which({ query: 'bash' });
console.log(c.results);
```

### 响应示例

```json
{
  "ok": true,
  "query": "python",
  "command": "where",
  "results": [
    "C:\\\\Python311\\\\python.exe",
    "C:\\\\Users\\\\me\\\\AppData\\\\Local\\\\Microsoft\\\\WindowsApps\\\\python.exe"
  ],
  "exitCode": 0,
  "signal": null,
  "stdout": "C:\\\\Python311\\\\python.exe\\r\\nC:\\\\Users\\\\me\\\\AppData\\\\Local\\\\Microsoft\\\\WindowsApps\\\\python.exe\\r\\n",
  "stderr": "",
  "timedOut": false,
  "durationMs": 12
}
```

