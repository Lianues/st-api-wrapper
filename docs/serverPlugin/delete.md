# serverPlugin.delete

## 描述

删除一个后端 Server Plugin（删除 `plugins/<name>` 目录或文件），并可在删除后自动重启酒馆后端以生效。

> 该 API 依赖后端存在 `/api/plugins/server-plugin-manager/delete`。  
> 删除后端文件同样有风险，请确认你删除的是正确的插件目录名。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 插件目录名（或插件文件名）。 |
| restart | boolean | 否 | 删除成功后是否自动重启（默认 `true`）。 |
| restartMode | string | 否 | `respawn` 或 `exit`（默认 `respawn`）。 |
| restartDelayMs | number | 否 | 重启延迟（毫秒，默认 `800`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| name | string | （成功时）回显。 |
| kind | string | （成功时）`directory` 或 `file`。 |
| restart | object \| null | 是否已调度重启。 |
| error | string | （失败时）错误信息。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const r = await ST_API.serverPlugin.delete({
  name: 'command-exec',
  restart: true,
});
console.log(r);
```

