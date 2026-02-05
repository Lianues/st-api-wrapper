# functionCalling.register

## 描述

注册一个 Function Tool（工具）到酒馆的 `ToolManager`。

- LLM 只有在“工具调用开启 + Prompt 中允许触发工具调用”的情况下，才可能真正调用你的工具。
- 工具 `action` 可以是 async。
- 若 `action` 返回非 string，酒馆会对返回值执行 `JSON.stringify(...)`，并作为 tool result 写入。

本 wrapper 相比原生 `registerFunctionTool` 多了一个更安全的行为：

- 默认 **不允许覆盖** 同名工具（避免误伤内置/其他插件工具）
- 如需覆盖，传 `allowOverwrite: true`

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 工具内部名称（必须唯一；LLM 调用时使用） |
| displayName | string | 否 | 显示名称（UI 展示用） |
| description | string | 是 | 工具描述（建议写清楚“什么时候用、做什么”） |
| parameters | object | 是 | JSON Schema（draft-04 风格） |
| action | function | 是 | 工具执行函数：`(params) => any \| Promise<any>` |
| formatMessage | function | 否 | 自定义 toast 文案：`(params) => string \| Promise<string>`；返回空字符串可禁用 toast |
| shouldRegister | function | 否 | 决定“本次请求”是否把工具注册进 tools 列表：`() => boolean \| Promise<boolean>` |
| stealth | boolean | 否 | 是否 stealth（不写入可见聊天/不触发 follow-up），默认 `false` |
| allowOverwrite | boolean | 否 | 是否允许覆盖同名工具，默认 `false` |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功 |
| name | string | 工具名称 |
| overwritten | boolean | 是否发生了覆盖（当 allowOverwrite=true 且同名工具已存在时） |
| registeredAt | number | 注册时间戳（毫秒） |
| error | string | 失败时的错误信息 |

---

## 示例

### 注册一个简单工具（myFunction）

```ts
const reg = await ST_API.functionCalling.register({
  name: 'myFunction',
  displayName: 'My Function',
  description: '演示工具：把 param1 和 param2 拼起来。仅在用户明确要求时调用。',
  parameters: {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    properties: {
      param1: { type: 'string', description: '参数 1' },
      param2: { type: 'string', description: '参数 2' },
    },
    required: ['param1', 'param2'],
  },
  action: async ({ param1, param2 }) => {
    return {
      ok: true,
      combined: `${param1}-${param2}`,
    };
  },
  formatMessage: ({ param1, param2 }) => `myFunction called: ${param1}, ${param2}`,
  shouldRegister: () => true,
  stealth: false,
});

console.log(reg);

// 你也可以立刻列出当前已注册的 tools
const list = await ST_API.functionCalling.list();
console.log(list.tools.map(t => t.name));
```

### 响应示例

```json
{
  "ok": true,
  "name": "myFunction",
  "overwritten": false,
  "registeredAt": 1730000000000
}
```
