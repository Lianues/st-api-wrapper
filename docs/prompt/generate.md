# prompt.generate

## 描述

真正发起一次“生成请求”（非 dry-run），并返回生成结果文本。

该接口支持两种模式：

- **writeToChat=true**：走酒馆原生生成流程（会写入当前聊天、触发 UI/事件）。可通过监听 `STREAM_TOKEN_RECEIVED` 提供 **token 流式回调**。
- **writeToChat=false**：后台生成（不写入聊天），只返回文本。  

> 注意：当 `writeToChat=true` 时，为避免不可逆地破坏当前聊天，**不支持** `chatHistory.replace/inject`。

---

## 输入（GenerateInput）

> `GenerateInput` 继承 `BuildRequestInput`，因此也支持 `preset/worldbook/extraBlocks` 等（但在 writeToChat=true 时有约束）。

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| timeoutMs | number | 8000 | 超时（毫秒）。真实生成可能很久，建议自行调大。 |
| forceCharacterId | number | - | 可选：强制指定角色 ID。 |
| writeToChat | boolean | false | 是否写入当前聊天。 |
| stream | boolean | false | 是否启用流式回调。 |
| onToken | `(delta, full) => void` | - | 流式 token 回调（delta 为新增片段，full 为累计文本）。 |
| includeRequest | boolean | false | 是否在输出中附带本次使用的请求构造结果（便于调试）。 |
| preset | 同 buildRequest | `{mode:'current'}` | 预设策略。 |
| worldbook | 同 buildRequest | `{mode:'current'}` | 世界书策略（`disable` 会设置 `skipWIAN=true`）。 |
| chatHistory | 同 buildRequest | - | **仅 writeToChat=false 时可用**。 |
| extraBlocks | 同 buildRequest | - | 额外块插入（对 Chat Completions 生效）。 |

> 说明：`preset.inject/replace` 传入的 `PresetInfo` 可包含 `utilityPrompts`，会随本次请求一并生效（不要混在 `other` 里）。

---

## 输出（GenerateOutput）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| timestamp | number | 时间戳。 |
| characterId | number? | 使用的角色 ID。 |
| text | string | 最终生成文本。 |
| from | `'inChat' \| 'background'` | 本次生成来源。 |
| request | BuildRequestOutput? | 可选：本次使用的请求构造结果（当 includeRequest=true）。 |

---

## 示例

### 1）后台生成（不写入聊天），拿最终文本

```typescript
const res = await ST_API.prompt.generate({
  writeToChat: false,
  timeoutMs: 60000,
});
console.log(res.text);
```

### 2）写入聊天 + 流式 token 回调

```typescript
const res = await ST_API.prompt.generate({
  writeToChat: true,
  stream: true,
  timeoutMs: 120000,
  onToken: (delta, full) => {
    console.log('delta:', delta);
    // console.log('full:', full);
  },
});
console.log('final:', res.text);
```

### 3）后台生成 + 注入预设 + 插入 extraBlocks（Chat Completions）

```typescript
const injectedPreset = (await ST_API.preset.get({ name: 'Default' })).preset;
if (!injectedPreset) throw new Error('preset not found');

const res = await ST_API.prompt.generate({
  writeToChat: false,
  preset: { inject: injectedPreset },
  extraBlocks: [
    { role: 'system', content: '（注入）你必须用中文回答。', index: 0 },
  ],
  includeRequest: true,
  timeoutMs: 60000,
});

console.log(res.text);
console.log(res.request?.chatCompletionMessages);
```

