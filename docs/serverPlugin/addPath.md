# serverPlugin.addPath

## 描述

从后端服务器的某个本地路径导入（复制）一个目录/文件到酒馆的 `plugins/` 目录中，并可在导入后自动重启酒馆后端以生效。

> 该 API 依赖后端存在 `/api/plugins/server-plugin-manager/addPath`。  
> `sourcePath` 指的是 **后端机器** 的路径，不是浏览器本机路径（除非你是在同一台机器上运行酒馆）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| sourcePath | string | 是 | 后端服务器本地路径（目录或文件）。 |
| folderName | string | 否 | 安装到 `plugins/<folderName>`（不填则使用 sourcePath 的 basename）。 |
| restart | boolean | 否 | 导入成功后是否自动重启（默认 `true`）。 |
| restartMode | string | 否 | `respawn` 或 `exit`（默认 `respawn`）。 |
| restartDelayMs | number | 否 | 重启延迟（毫秒，默认 `800`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| sourcePath | string | 回显源路径。 |
| folderName | string | 实际安装目录名（或文件名）。 |
| path | string | 实际安装绝对路径。 |
| kind | string | `directory` 或 `file`（源路径类型）。 |
| restart | object \| null | 是否已调度重启。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 从后端本地路径导入目录到 plugins/
const out = await ST_API.serverPlugin.addPath({
  sourcePath: 'F:\\\\SillyTavern\\\\my-plugins\\\\command-exec',
  folderName: 'command-exec',
  restart: true,
});
console.log(out);
```

