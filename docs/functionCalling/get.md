# functionCalling.get

## 描述

按名称获取一个已注册的 Function Tool 的信息。

内部实现等价于：

- 遍历 `ToolManager.tools`
- 匹配 `name`

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 工具名称 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否找到 |
| tool | object | 工具信息（当 ok=true 时存在） |
| error | string | 失败原因（当 ok=false 时存在） |

---

## 示例

```ts
const res = await ST_API.functionCalling.get({ name: 'GenerateImage' });
if (res.ok) {
  console.log(res.tool);
} else {
  console.warn(res.error);
}
```

### 响应示例

```json
{
  "ok": true,
  "tool": {
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
  }
}
```
