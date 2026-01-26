# command.env

## 描述

读取后端（酒馆 Node 进程）的环境变量。默认返回常用子集，也可以：

- `all=true` 获取全量 env
- 传 `keys` 指定读取的 key 列表

> 该 API 依赖后端存在 `/api/plugins/command-exec/env`。若未安装 server plugin，会请求失败（通常 404）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| all | boolean | 否 | 是否返回全量 env（默认 `false`）。 |
| keys | string[] | 否 | 指定需要返回的 env key 列表。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| env | object | 环境变量映射表（key -> value）。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 默认：常用 env 子集
const a = await ST_API.command.env();
console.log(a.env.PATH);

// 指定 keys
const b = await ST_API.command.env({ keys: ['SHELL', 'ST_TERMINAL', 'PATH'] });
console.log(b.env);

// 全量（不建议长期暴露在 UI 上）
const c = await ST_API.command.env({ all: true });
console.log(Object.keys(c.env).length);
```

### 响应示例

```json
{
  "ok": true,
  "env": {
    "SHELL": "/bin/bash",
    "ST_TERMINAL": "bash",
    "PATH": "..."
  }
}
```

