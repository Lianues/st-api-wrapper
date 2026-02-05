# functionCalling

Function Calling（工具调用）相关 API。

本命名空间主要对酒馆的原生接口进行一层 wrapper：

- `SillyTavern.getContext().registerFunctionTool(...)`
- `SillyTavern.getContext().unregisterFunctionTool(...)`
- `SillyTavern.getContext().ToolManager.tools`（列出工具）
- `SillyTavern.getContext().ToolManager.invokeFunctionTool(...)`（手动调用工具）

> 注意：工具调用是否可用，取决于你当前使用的模型/接口是否支持，以及用户是否在 UI 中开启了“Enable function calling”。
> 你可以用 `functionCalling.isSupported()` 先做探测。

本 wrapper 还会在内部记录“哪些工具是通过 `ST_API.functionCalling.register` 注册的”，用于：

- `functionCalling.list({ onlyRegisteredByWrapper: true })`：只列出你自己注册的工具
- `functionCalling.unregister({ force: false })`：默认只允许注销自己注册的工具（防误伤）
