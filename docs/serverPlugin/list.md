# serverPlugin.list

## 描述

列出酒馆后端 `plugins/` 目录下的所有 **Server Plugins**（目录插件/文件插件），用于前端做可视化管理。

> 该 API 依赖后端存在 `/api/plugins/server-plugin-manager/list`。若未安装 server plugin，会请求失败（通常 404）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| includeInfo | boolean | 否 | 是否尝试读取插件 `info`（会 `import` 插件入口文件；默认 `true`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| pluginsRoot | string | 后端实际的 `plugins/` 目录绝对路径。 |
| plugins | array | 插件列表。 |

### plugins[] 结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 目录名（或文件名）。 |
| kind | string | `directory` 或 `file`。 |
| path | string | 后端绝对路径。 |
| entryFile | string | （可选）插件入口文件路径。 |
| entryMissing | boolean | （可选）入口文件不存在（例如 package.json.main 指向了不存在的文件）。 |
| packageJson | object | （可选）解析到的 package.json（name/version/main）。 |
| info | object | （可选）插件导出的 `info`（id/name/description）。 |
| infoError | string | （可选）读取 info 的错误信息。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const r = await ST_API.serverPlugin.list({ includeInfo: true });
console.log(r.pluginsRoot);
console.table(r.plugins.map(p => ({
  name: p.name,
  kind: p.kind,
  id: p.info?.id,
  title: p.info?.name,
})));
```

### 响应示例

```json
{
  "ok": true,
  "pluginsRoot": "F:\\\\SillyTavern\\\\plugins",
  "plugins": [
    {
      "name": "command-exec",
      "kind": "directory",
      "path": "F:\\\\SillyTavern\\\\plugins\\\\command-exec",
      "entryFile": "F:\\\\SillyTavern\\\\plugins\\\\command-exec\\\\index.mjs",
      "entryMissing": false,
      "packageJson": null,
      "info": {
        "id": "command-exec",
        "name": "Command Exec",
        "description": "Execute backend commands via SillyTavern server plugin."
      },
      "infoError": null
    }
  ]
}
```

