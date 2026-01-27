# macros.unregister

## 描述

注销一个自定义宏。

- 默认只允许注销**通过 `ST_API.macros.register` 注册的宏**（包含其 aliases），避免误删酒馆内置宏或其他插件宏。
- 若要强制注销任意宏名，传 `force: true`（风险自担）。
- 如果你在注册时启用了 `registerLegacy`，在 `experimental_macro_engine` 关闭的情况下，本接口也会尝试同步移除旧宏镜像。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 宏名称（可传 alias） |
| force | boolean | 否 | 是否强制注销（默认 `false`） |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功 |
| removed | string[] | 实际移除的宏名列表 |
| error | string | 失败时的错误信息 |

---

## 示例

### 注册带 alias 的宏并注销

```ts
await ST_API.macros.register({
  name: 'upper',
  options: {
    category: 'custom',
    aliases: [{ alias: 'up' }],
    unnamedArgs: 1,
    handler: ({ unnamedArgs }) => String(unnamedArgs[0] ?? '').toUpperCase(),
  },
});

// 传 alias 也可以：会移除 upper 和 up（因为它们都是通过 wrapper 注册的）
const res = await ST_API.macros.unregister({ name: 'up' });
console.log(res.ok, res.removed);
```

### 响应示例

```json
{
  "ok": true,
  "removed": ["upper", "up"]
}
```

