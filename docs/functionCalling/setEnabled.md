# functionCalling.setEnabled

## 描述

开启或关闭前端“启用函数调用（Enable function calling）”开关。

本 API 会直接执行：

- 修改 `SillyTavern.getContext().chatCompletionSettings.function_calling`
- 调用 `saveSettingsDebounced()` 保存设置

> 注意：开启开关 ≠ 当前一定“支持工具调用”。
> 实际是否支持取决于：主 API 是否为 openai/chat completion、模型能力、以及提示词后处理选项等。
> 你可以结合 `functionCalling.isSupported()` / 本接口返回的 `supported` 字段判断。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| enabled | boolean | 是 | 是否开启 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功 |
| enabled | boolean | 修改后的 enabled 状态 |
| supported | boolean | 修改后再次探测：是否支持工具调用 |
| error | string | 失败原因 |

---

## 示例

### 开启函数调用

```ts
const res = await ST_API.functionCalling.setEnabled({ enabled: true });
console.log(res);
```

### 关闭函数调用

```ts
const res = await ST_API.functionCalling.setEnabled({ enabled: false });
console.log(res);
```

### 响应示例

```json
{
  "ok": true,
  "enabled": true,
  "supported": true
}
```
