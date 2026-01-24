# ST API Wrapper - 文档

本插件的所有 API 文档**不在代码中维护**，统一放在 `docs/` 目录下，并且按照 API 的“实际路径”进行组织。

## 目录规范

- API 调用路径：`<namespace>.<endpoint>`
- 文档路径：`docs/<namespace>/<endpoint>.md`

示例：
- API：`prompt.get`
- 文档：`docs/prompt/get.md`

## 文档模板（每个 endpoint）

每个 endpoint 至少包含以下三个章节：

- 描述
- 输入
- 输出

## 核心写作原则

1. **示例为王**：每个 API 必须包含详细的 **TypeScript 使用示例** 和 **JSON 响应示例**。
2. **消息基准格式**：所有涉及对话消息的示例，默认使用 **Gemini 格式**（`parts` 数组结构）。
3. **保留历史语境**：在更新文档时，**严禁为了展示新字段而删除旧字段的示例**。应保持示例的完整性，让开发者能看到所有可用的属性。
4. **命名风格**：所有 API 参数和响应字段统一使用 **驼峰命名 (camelCase)**。
5. **严禁删除注释**：代码和文档中的原有逻辑说明和注释具有极高的参考价值，禁止随意删除。

> 备注：代码侧会提供：
>
> - `window.ST_API.listEndpoints()`：列出所有 endpoint（`namespace.endpoint`）
> - `window.ST_API.getDocPath(fullName)`：返回约定的文档路径（例如 `docs/prompt/get.md`）
>
> 你也可以执行 `npm run docs:stub` 自动生成缺失的文档空壳。

如果有示例，越详细越好，不要为了新字段而删除旧字段的示例。而且需要提示用户提供响应，需要包含使用示例和响应示例

消息基准格式为gemini格式

还有就是不要乱删注释