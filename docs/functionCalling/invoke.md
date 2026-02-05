# functionCalling.invoke

## 描述

手动调用一个已注册的 Function Tool。

- 这不会让 LLM 自动触发工具调用；它只是“像 ToolManager 那样”直接执行 tool 的 `action`。
- 常用于：调试你的 tool、单元测试、或在不走 LLM 的情况下复用同一套工具逻辑。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 工具名称 |
| parameters | any | 否 | 参数对象（或 JSON 字符串；酒馆内部会解析） |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功 |
| name | string | 工具名称 |
| result | string | tool result（酒馆保证是 string；非 string 会被 JSON.stringify） |
| error | string | 失败原因 |

---

## 示例

```ts
await ST_API.functionCalling.register({
  name: 'sum',
  description: '求和',
  parameters: {
    type: 'object',
    properties: {
      a: { type: 'number' },
      b: { type: 'number' },
    },
    required: ['a', 'b'],
  },
  action: ({ a, b }) => Number(a) + Number(b),
});

const out = await ST_API.functionCalling.invoke({
  name: 'sum',
  parameters: { a: 1, b: 2 },
});

console.log(out.result); // => "3"
```

### 响应示例

```json
{
  "ok": true,
  "name": "sum",
  "result": "3"
}
```
