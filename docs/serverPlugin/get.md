# serverPlugin.get

## 描述

获取某个后端 Server Plugin 的详细信息（按目录名或文件名）。

> 该 API 依赖后端存在 `/api/plugins/server-plugin-manager/get`。若未安装 server plugin，会请求失败（通常 404）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 插件目录名（或插件文件名）。 |
| includeInfo | boolean | 否 | 是否尝试读取插件 `info`（会 `import` 插件入口文件；默认 `true`）。 |

## 输出

成功时：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 固定为 `true`。 |
| name | string | 插件目录名/文件名。 |
| kind | string | `directory` 或 `file`。 |
| path | string | 后端绝对路径。 |
| entryFile | string | （可选）入口文件路径。 |
| entryMissing | boolean | （可选）入口文件不存在。 |
| packageJson | object | （可选）解析到的 package.json（name/version/main）。 |
| info | object | （可选）插件导出的 `info`。 |
| infoError | string | （可选）读取 info 的错误。 |

失败时：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 固定为 `false`。 |
| error | string | 错误描述。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const r = await ST_API.serverPlugin.get({ name: 'command-exec' });
console.log(r);
```

