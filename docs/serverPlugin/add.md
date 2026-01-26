# serverPlugin.add

## 描述

通过 `git clone` 安装一个后端 Server Plugin 到酒馆的 `plugins/` 目录中，并可在安装后自动重启酒馆后端以生效。

> 该 API 依赖后端存在 `/api/plugins/server-plugin-manager/add`。  
> 该操作非常危险（等同于让前端远程执行 git clone + 写入后端文件系统），请只在你完全信任的环境中使用。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| gitUrl | string | 是 | Git 仓库 URL。 |
| folderName | string | 否 | 安装到 `plugins/<folderName>`（不填则从 URL 推断，例如 `xxx.git` -> `xxx`）。 |
| branch | string | 否 | 指定分支（可选）。 |
| restart | boolean | 否 | 安装成功后是否自动重启（默认 `true`）。 |
| restartMode | string | 否 | `respawn`（尽力自拉起新进程）或 `exit`（仅退出旧进程），默认 `respawn`。 |
| restartDelayMs | number | 否 | 重启延迟（毫秒，默认 `800`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | git clone 是否成功。 |
| folderName | string | 实际安装目录名。 |
| path | string | 实际安装绝对路径。 |
| git | object | `git clone` 的执行结果（stdout/stderr/exitCode 等）。 |
| restart | object \| null | 是否已调度重启。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const r = await ST_API.serverPlugin.add({
  gitUrl: 'https://github.com/SillyTavern/SillyTavern-EdgeTTS-Plugin.git',
  restart: true,
  restartMode: 'respawn',
});
console.log(r);
```

