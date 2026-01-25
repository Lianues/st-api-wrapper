# prompt.buildRequest

## 描述

生成一次“请求内容”（dry-run）：在**不真正调用模型**的前提下，尽可能复刻酒馆内部的合成流程，拿到最终将用于请求的：

- Chat Completions：`messages[]`
- Text Completions：`prompt` 字符串
- （可选）更接近后端的 `generateData`

同时支持最大程度的自定义：

- **预设**：使用当前 / 禁用 / 注入（合并）/ 替换 `PresetInfo`（格式参考 `preset.get`）
- **世界书**：使用当前 / 禁用 / 注入（合并）/ 替换世界书（作为 chat lorebook）
- **聊天记录**：使用当前 / 注入 `ChatMessage[]`（wrapper 格式）
- **额外块**：直接插入 `{role, content}` 段落到最终 `messages[]`

---

## 输入（BuildRequestInput）

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| timeoutMs | number | 8000 | 超时（毫秒）。 |
| forceCharacterId | number | - | 可选：强制指定角色 ID。 |
| preset | { mode?, inject?, replace? } | `{mode:'current'}` | 预设策略：`inject` 为合并（同名 identifier 覆盖），`replace` 为整段替换。`inject` 与 `replace` 互斥。 |
| worldBook | { mode?, inject?, replace? } | `{mode:'current'}` | 世界书策略：`inject` 为合并（同名条目 comment 覆盖），`replace` 为整本替换（结束回滚，不落盘）。`disable` 会设置 `skipWIAN=true`（同时跳过世界书与作者注释）。`inject` 与 `replace` 互斥。 |
| chatHistory | { replace?, inject? } | - | 聊天记录：`replace` 负责整段替换；`inject` 负责按 depth/order 注入历史块。 |
| extraBlocks | ExtraMessageBlock[] | - | 额外消息段插入（仅对 Chat Completions 生效）。 |
| includeGenerateData | boolean | false | 是否尝试构造更接近后端的 payload。openai 会调用 `/scripts/openai.js` 的 `createGenerationParameters`。 |

### preset
- `mode`：`current`（默认）或 `disable`。
  - `disable` 会临时把当前 prompts 全部置为 disabled（仅影响本次 build）。
  - 若 `mode='disable'`，则会忽略 `inject/replace`。
- `inject`：将你提供的 `PresetInfo` 作为 patch 合并到当前预设（同名 identifier 覆盖）。
- `replace`：本次 build 整体替换为你提供的 `PresetInfo`。

> 说明：`inject` 与 `replace` 互斥。
> 另外：`PresetInfo` 支持 `utilityPrompts`（例如 `newChatPrompt`、`worldInfoFormat` 等），可以随 `inject/replace` 一并传入并生效；请放在 `preset.utilityPrompts` 中，不要混在 `preset.other` 里。

### worldBook
- `mode`：`current`（默认）或 `disable`。
  - `disable` 会设置 `skipWIAN=true`（跳过世界书与作者注释）。
  - 若 `mode='disable'`，则会忽略 `inject/replace`。
- `replace`：本次 build 使用你提供的 `WorldBook` 作为 chat lorebook（结束回滚，不落盘）。
- `inject`：本次 build 将你提供的 `WorldBook` 条目合并到当前 chat lorebook（同名 comment 覆盖，结束回滚）。

> 说明：实现上会用临时书名写入 `worldInfoCache`，并把 `chat_metadata['world_info']` 临时指向该书名。

### chatHistory.replace（整段替换聊天记录）
你可以理解为：本次 dry-run 临时换了一份“聊天历史”。结束会自动回滚。

### chatHistory.inject（按 depth/order 注入历史块）
你可以理解为：临时插入了一组“带 depth/order 的 history 块”，类似预设/世界书的注入逻辑。

- `depth`：从末尾开始计数（等价“间隙索引”）
  - 0：最后一个消息之后
  - 1：最后一个与倒数第二个之间
  - ...
- `order`：同一 depth 下排序，越小越靠前（默认 100）

### extraBlocks（ExtraMessageBlock）
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| role | string | 角色，如 `system/user/assistant` |
| content | string | 内容 |
| name | string? | 可选 name |
| index | number? | 插入到最终 `messages[]` 的“间隙”索引（从末尾计数）：0=最后一个消息块之后；1=最后与倒数第二之间；…；`messages.length`=第一个之前。默认 0。 |

---

## 输出（BuildRequestOutput）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| timestamp | number | 时间戳。 |
| characterId | number? | 使用的角色 ID。 |
| chatCompletionMessages | object[]? | Chat Completions：最终 `messages[]`。 |
| textPrompt | string? | Text Completions：最终 `prompt`。 |
| generateData | any? | 可选：更接近后端的 payload。 |

---

## 示例

### 1）最小示例：直接拿最终 messages / prompt

```typescript
const res = await ST_API.prompt.buildRequest();
console.log(res.chatCompletionMessages ?? res.textPrompt);
```

### 2）注入预设（Prompt 注入）

```typescript
const injectedPreset = (await ST_API.preset.get({ name: 'Default' })).preset;
if (!injectedPreset) throw new Error('preset not found');

const res = await ST_API.prompt.buildRequest({
  preset: { inject: injectedPreset },
});
console.log(res.chatCompletionMessages);
```

### 3）禁用世界书（同时会跳过作者注释）

```typescript
const res = await ST_API.prompt.buildRequest({
  worldBook: { mode: 'disable' },
});
```

### 4）注入世界书（作为 chat worldBook）

```typescript
const book = await ST_API.worldBook.get({ name: 'Current Chat', scope: 'chat' });

const res = await ST_API.prompt.buildRequest({
  worldBook: { replace: book.worldBook },
});
```

### 5）注入聊天记录（wrapper ChatMessage[]）

```typescript
const injectedChat = [
  { role: 'system', parts: [{ text: '你是一个有用的助手。' }] },
  { role: 'user', parts: [{ text: '你好' }] },
];

const res = await ST_API.prompt.buildRequest({
  chatHistory: { replace: injectedChat },
});
```

### 5.1）在不替换历史的情况下，按 depth/order 注入“历史块”

```typescript
const res = await ST_API.prompt.buildRequest({
  chatHistory: {
    inject: [
      // depth=0：插到最后（最新）
      { depth: 0, order: 100, message: { role: 'user', parts: [{ text: '（注入）这是一条临时用户历史' }] } },

      // depth=1：插到倒数第二与最后之间
      { depth: 1, order: 50, message: { role: 'assistant', parts: [{ text: '（注入）这是一条临时助手历史' }] } },
    ],
  },
});
```

### 6）插入额外 role/content 段

```typescript
const res = await ST_API.prompt.buildRequest({
  extraBlocks: [
    // 0：最后一个消息之后（append）
    { role: 'user', content: '追加一个 user 段（插到末尾）', index: 0 },

    // 1：插入到“最后一个”和“倒数第二个”之间
    { role: 'system', content: '插在倒数第二与最后之间', index: 1 },
  ],
});
```

### 7）拿更接近后端的 generateData（openai）

```typescript
const res = await ST_API.prompt.buildRequest({
  includeGenerateData: true,
});

console.log(res.generateData);
```

> 说明：openai 的 `generateData` 会调用酒馆前端模块 `/scripts/openai.js` 的 `createGenerationParameters` 生成；非 openai 则直接复用酒馆 dry-run 阶段的 `generate_after_data`。

---

## 调试 / 验证：worldBook.replace / worldBook.inject 是否生效

前置条件：
- 已在酒馆里启用 `st-api-wrapper` 扩展，并能在控制台访问 `window.ST_API`
- 当前使用 Chat Completions（如 OpenAI）时更直观：注入内容会出现在 `chatCompletionMessages` 的 `system` 段里

下面脚本会：
1) 在某本世界书里创建一个“关键词必命中”的条目（key=你好）
2) 用 `chatHistory.replace` 固定构造一段包含“你好”的聊天
3) 调用 `prompt.buildRequest` 并检查 messages 中是否包含该条目内容
4) 最后清理临时条目

```typescript
(async () => {
  const bookName = "StepWorkflow_Test_WB";
  const scope = "global";

  // 0) 确保世界书存在（已存在会报错，忽略即可）
  try {
    await ST_API.worldBook.create({ name: bookName, scope });
  } catch {}

  // 1) 创建一个一定会命中的 keyword 条目（key=你好）
  const created = await ST_API.worldBook.createEntry({
    name: bookName,
    scope,
    entry: {
      name: "WF_DEBUG_KEYWORD",
      activationMode: "keyword",
      key: ["你好"],
      enabled: true,
      position: "beforeChar",
      order: 0,
      content: "【WF_DEBUG_KEYWORD】如果你能在 messages 里看到我，说明 worldBook 注入生效。",
    },
  });
  const idx = created?.entry?.index;

  // 2) buildRequest：注入世界书并打印 messages
  const wb = (await ST_API.worldBook.get({ name: bookName, scope })).worldBook;

  const br = await ST_API.prompt.buildRequest({
    // 用固定聊天保证关键词命中（不影响真实聊天，结束自动回滚）
    chatHistory: {
      replace: [
        { role: "system", parts: [{ text: "你现在是一个更加专业的助手。" }] },
        { role: "user", parts: [{ text: "你好" }] },
      ],
    },

    // 你也可以把 replace 改成 inject（语义：合并到当前 chat lorebook）
    worldBook: { replace: wb },
  });

  console.log("messages =", br.chatCompletionMessages);
  console.log(
    "hasDebugWB =",
    (br.chatCompletionMessages ?? []).some((m) => String(m?.content ?? "").includes("WF_DEBUG_KEYWORD")),
  );

  // 3) 清理：删除临时条目
  if (typeof idx === "number") {
    await ST_API.worldBook.deleteEntry({ name: bookName, scope, index: idx });
  }
})();
```

