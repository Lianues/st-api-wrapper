# serverApi.register

## 描述

**动态注册一个“服务端 API 调用函数”** 到 `ST_API` 下。

用途：当你安装了某个 server plugin（或后端已有某个 API 端点）时，你不想每次都改 `st-api-wrapper` 源码写死一个 wrapper，可以在前端运行时调用本接口，把一个后端 URL 包装成 `ST_API.<namespace>.<name>(input)`。

> 本接口只是在前端生成 `fetch` 包装函数，并注册到 `ST_API` 的内部 registry；它不会在后端创建路由。\n

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| namespace | string | 是 | 要注册到 `ST_API` 的命名空间（例如 `myPlugin`）。要求为合法标识符（`[a-zA-Z0-9_]` 且不以数字开头）。 |
| name | string | 是 | endpoint 名称（例如 `probe`）。要求为合法标识符。 |
| url | string | 是 | 后端 URL（通常以 `/` 开头，例如 `/api/plugins/command-exec/probe`）。 |
| method | string | 否 | HTTP 方法（默认 `POST`）。 |
| useRequestHeaders | boolean | 否 | 是否自动附带酒馆的鉴权/CSRF 请求头（默认 `true`）。 |
| headers | object | 否 | 额外 headers（可选；会覆盖同名 header）。 |
| contentType | string | 否 | 请求 Content-Type（默认 `application/json`）。GET/HEAD 会忽略 body。 |
| responseType | string | 否 | 响应解析方式：`json`（默认）或 `text`。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| fullName | string | 完整名：`namespace.name`。 |
| namespace | string | 回显。 |
| name | string | 回显。 |
| url | string | 回显。 |
| method | string | 回显。 |
| contentType | string | 回显。 |
| responseType | string | 回显。 |

---

## 示例

### 例 1：把 server plugin 的 probe 注册成函数

```typescript
// 将 /api/plugins/command-exec/probe 注册为 ST_API.commandExec.probe()
await ST_API.serverApi.register({
  namespace: 'commandExec',
  name: 'probe',
  url: '/api/plugins/command-exec/probe',
  method: 'POST',
});

const r = await ST_API.commandExec.probe({});
console.log(r);
```

### 例 2：注册 text 响应的 GET

```typescript
await ST_API.serverApi.register({
  namespace: 'misc',
  name: 'versionText',
  url: '/version',
  method: 'GET',
  responseType: 'text',
});

const text = await ST_API.misc.versionText();
console.log(text);
```

