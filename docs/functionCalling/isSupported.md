# functionCalling.isSupported

## 描述

检查当前环境是否支持 Function Calling（工具调用），并且用户已在酒馆设置里启用该功能。

本接口等价于调用：`SillyTavern.getContext().isToolCallingSupported()`。

## 输入

无。

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| supported | boolean | 是否支持并已启用工具调用 |

---

## 示例

```ts
const res = await ST_API.functionCalling.isSupported();
if (!res.supported) {
  console.warn('当前模型/设置不支持 Function Calling');
}
```

### 响应示例

```json
{
  "supported": true
}
```
