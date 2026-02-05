# functionCalling.unregister

## 描述

注销（移除）一个已注册的 Function Tool。

为了避免误伤内置/其他插件注册的工具：

- 默认仅允许注销“由本 wrapper（`ST_API.functionCalling.register`）注册过”的工具
- 若确实要强制移除，传 `force: true`

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 工具名称 |
| force | boolean | 否 | 是否强制注销（忽略来源），默认 `false` |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功 |
| name | string | 工具名称 |
| existed | boolean | 注销前工具是否存在（用于调试） |
| error | string | 失败时的错误信息 |

---

## 示例

```ts
// 推荐：先注册，再注销
await ST_API.functionCalling.register({
  name: 'tmpTool',
  description: '临时工具',
  parameters: { type: 'object', properties: {}, required: [] },
  action: () => 'ok',
});

const res = await ST_API.functionCalling.unregister({ name: 'tmpTool' });
console.log(res);
```

### 响应示例

```json
{
  "ok": true,
  "name": "tmpTool",
  "existed": true
}
```
