# functionCalling.list

## 描述

列出当前已注册的 Function Tools。

数据来源：`SillyTavern.getContext().ToolManager.tools`。

并且会额外附带一个字段 `registeredByWrapper`，用于标记该工具是否由 `ST_API.functionCalling.register` 注册。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| onlyRegisteredByWrapper | boolean | 否 | 是否仅列出由本 wrapper 注册的工具，默认 `false` |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| tools | array | 工具列表 |

### tools[*] 结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 工具名称 |
| displayName | string | 显示名称（可能为空） |
| description | string | 描述 |
| parameters | object | JSON Schema |
| stealth | boolean | 是否 stealth |
| registeredByWrapper | boolean | 是否由本 wrapper 注册 |
| registeredAt | number | 注册时间戳（仅当 registeredByWrapper=true 时存在） |

---

## 示例

```ts
const all = await ST_API.functionCalling.list();
console.log(all.tools);

const mine = await ST_API.functionCalling.list({ onlyRegisteredByWrapper: true });
console.log(mine.tools);
```

### 响应示例

```json
{
  "tools": [
    {
      "name": "GenerateImage",
      "displayName": "Generate Image",
      "description": "Generate an image based on the prompt.",
      "parameters": {
        "type": "object",
        "properties": {
          "prompt": { "type": "string" }
        },
        "required": ["prompt"]
      },
      "stealth": false,
      "registeredByWrapper": false
    },
    {
      "name": "myFunction",
      "displayName": "My Function",
      "description": "演示工具：把 param1 和 param2 拼起来。仅在用户明确要求时调用。",
      "parameters": {
        "type": "object",
        "properties": {
          "param1": { "type": "string" },
          "param2": { "type": "string" }
        },
        "required": ["param1", "param2"]
      },
      "stealth": false,
      "registeredByWrapper": true,
      "registeredAt": 1730000000000
    }
  ]
}
```
