# preset.get

## 描述

获取**单个**预设的详细配置。
响应结构已针对开发者体验进行了深度优化：
- **字段简化**：重命名了繁琐的注入参数（如 `depth`, `order`, `trigger`, `position`）。
- **合并状态**：将 `prompts` 与顺序列表合并，并自动同步启用状态。
- **自动排序**：数组已按照实际注入位置（`index`）进行排序。
- **单目标明确**：本接口仅获取单个预设；如需列出全部预设详情请使用 `preset.list()`。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | (可选) 预设名称。不传则返回当前活跃预设。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| preset | PresetInfo \| null | 单个预设对象，找不到则为 null。 |

### PresetInfo 结构
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 预设名称。 |
| prompts | PromptInfo[] | 合并后的 Prompt 列表，已按加载顺序排序。 |
| utilityPrompts | UtilityPrompts | 从 `other`（旧名 `apiSetting`）中迁移出来的 Utility Prompts（camelCase 命名，便于直接读取）。这些字段会从返回的 `other` 中移除。 |
| regexScripts | RegexScriptData[] | 预设绑定的正则脚本（从 `other.extensions.regex_scripts` 提取并做结构简化）。 |
| other | object | 采样参数（排除了 prompts 逻辑；包含 `extensions` 等字段）。 |

### PromptInfo 结构
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| identifier | string | 唯一 ID。 |
| name | string | Prompt 名称。 |
| enabled | boolean | 是否启用。 |
| index | number? | 在预设顺序列表中的索引。未加载则不存在。 |
| role | string | 消息角色 (system/user 等)。 |
| content | string | 文本内容。 |
| depth | number | 注入深度。 |
| order | number | 注入顺序。 |
| position | string | 注入位置模式: `'relative'` (相对) 或 `'fixed'` (固定)。 |
| trigger | any[] | 注入触发器。 |

### UtilityPrompts 结构

> 说明：这些字段对应酒馆 OpenAI 预设面板里的 **Utility Prompts / Format Templates** 一组配置。
> wrapper 会把它们从 `other`（旧名 `apiSetting`）中迁移到 `utilityPrompts`（camelCase），方便直接读取；并且会从返回的 `other` 中移除，避免重复与混淆。
> 注意：保存到酒馆原始预设时，仍会写回这些字段的原始键名（例如 `new_chat_prompt`）。

| 字段 | 类型 | 对应 other 字段（旧名 apiSetting） | 说明 |
| --- | --- | --- | --- |
| impersonationPrompt | string? | `impersonation_prompt` | Impersonation prompt：用于“代入/扮演（Impersonation）”功能的提示词。 |
| worldInfoFormat | string? | `wi_format` | World Info format template：包裹激活的世界书条目后插入到 prompt；用 `{0}` 标记插入点。 |
| scenarioFormat | string? | `scenario_format` | Scenario format template：场景格式模板；通常包含 `{{scenario}}`。 |
| personalityFormat | string? | `personality_format` | Personality format template：性格/人设格式模板；通常包含 `{{personality}}`。 |
| groupNudgePrompt | string? | `group_nudge_prompt` | Group Nudge prompt template：群聊历史末尾用于“强制某角色回复”的提示词模板。 |
| newChatPrompt | string? | `new_chat_prompt` | New Chat：聊天历史开头标识“新聊天”的提示词（例如 `[Start a new Chat]`）。 |
| newGroupChatPrompt | string? | `new_group_chat_prompt` | New Group Chat：群聊历史开头标识“新群聊”的提示词。 |
| newExampleChatPrompt | string? | `new_example_chat_prompt` | New Example Chat：示例对话开头标识“新示例聊天”的提示词。 |
| continueNudgePrompt | string? | `continue_nudge_prompt` | Continue nudge：点击 Continue 时追加到历史末尾的提示词。 |
| sendIfEmpty | string? | `send_if_empty` | Replace empty message：当输入框为空时，用该文本替代空消息。 |
| seed | number? | `seed` | Seed：随机种子。`-1` 表示随机。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 1) 获取当前活跃预设
const res = await ST_API.preset.get();
console.log('当前预设名称:', res.preset?.name);

// 2) 获取指定名称预设
const byName = await ST_API.preset.get({ name: 'Default' });
console.log('Default 预设:', byName.preset);

// 3) 获取全部预设详情（另一个接口）
const allRes = await ST_API.preset.list();
console.log('当前激活:', allRes.active);
console.log('所有预设详细内容:', allRes.presets);
```

## 响应示例

```json
{
  "preset": {
    "name": "Default",
    "prompts": [
      {
        "identifier": "main",
        "name": "Main Prompt",
        "enabled": true,
        "index": 0,
        "role": "system",
        "content": "你是一个有用的助手...",
        "depth": 0,
        "order": 100,
        "position": "relative",
        "trigger": []
      }
    ],
    "utilityPrompts": {
      "newChatPrompt": "[Start a new Chat]",
      "worldInfoFormat": "{0}",
      "seed": -1
    },
    "regexScripts": [],
    "other": { "temp": 1.0 }
  }
}
```

---

## other 字段记录（示例）

```json
{
  "preset_settings_openai": "Default",
  "temp_openai": 1.01,
  "freq_pen_openai": 0,
  "pres_pen_openai": 0,
  "top_p_openai": 1,
  "top_k_openai": 0,
  "min_p_openai": 0,
  "top_a_openai": 1,
  "repetition_penalty_openai": 1,
  "stream_openai": false,
  "openai_max_context": 4095,
  "openai_max_tokens": 300,
  "bias_preset_selected": "Anti-bond",
  "bias_presets": {
    "Anti-bond": [
      {
        "id": "22154f79-dd98-41bc-8e34-87015d6a0eaf",
        "text": " bond",
        "value": -50
      },
      {
        "id": "8ad2d5c4-d8ef-49e4-bc5e-13e7f4690e0f",
        "text": " future",
        "value": -50
      },
      {
        "id": "52a4b280-0956-4940-ac52-4111f83e4046",
        "text": " bonding",
        "value": -50
      },
      {
        "id": "e63037c7-c9d1-4724-ab2d-7756008b433b",
        "text": " connection",
        "value": -25
      }
    ]
  },
  "openai_model": "",
  "claude_model": "claude-3-opus-20240229",
  "google_model": "gemini-2.5-pro",
  "vertexai_model": "gemini-2.0-flash-001",
  "ai21_model": "jamba-1.5-large",
  "mistralai_model": "mistral-medium-latest",
  "cohere_model": "command-r-plus",
  "perplexity_model": "llama-3-70b-instruct",
  "groq_model": "llama3-70b-8192",
  "chutes_model": "deepseek-ai/DeepSeek-V3-0324",
  "chutes_sort_models": "alphabetically",
  "siliconflow_model": "deepseek-ai/DeepSeek-V3",
  "electronhub_model": "gpt-4o-mini",
  "electronhub_sort_models": "alphabetically",
  "electronhub_group_models": false,
  "nanogpt_model": "gpt-4o-mini",
  "deepseek_model": "deepseek-chat",
  "aimlapi_model": "gpt-4o-mini-2024-07-18",
  "xai_model": "grok-3-beta",
  "pollinations_model": "openai",
  "cometapi_model": "gpt-4o",
  "moonshot_model": "kimi-latest",
  "fireworks_model": "accounts/fireworks/models/kimi-k2-instruct",
  "zai_model": "glm-4.6",
  "zai_endpoint": "common",
  "azure_base_url": "",
  "azure_deployment_name": "",
  "azure_api_version": "2024-02-15-preview",
  "azure_openai_model": "",
  "custom_model": "ernie-4.5-turbo-128k",
  "custom_url": "http://154.219.123.184:5102/v1",
  "custom_include_body": "",
  "custom_exclude_body": "",
  "custom_include_headers": "",
  "openrouter_model": "deepseek/deepseek-chat-v3.1",
  "openrouter_use_fallback": false,
  "openrouter_group_models": false,
  "openrouter_sort_models": "alphabetically",
  "openrouter_providers": [
    "Chutes"
  ],
  "openrouter_allow_fallbacks": false,
  "openrouter_middleout": "on",
  "reverse_proxy": "",
  "chat_completion_source": "makersuite",
  "max_context_unlocked": false,
  "show_external_models": true,
  "proxy_password": "",
  "assistant_prefill": "",
  "assistant_impersonation": "",
  "use_sysprompt": true,
  "vertexai_auth_mode": "express",
  "vertexai_region": "us-central1",
  "vertexai_express_project_id": "",
  "squash_system_messages": false,
  "media_inlining": false,
  "inline_image_quality": "low",
  "bypass_status_check": false,
  "continue_prefill": false,
  "function_calling": false,
  "names_behavior": 0,
  "continue_postfix": " ",
  "custom_prompt_post_processing": "merge",
  "show_thoughts": true,
  "reasoning_effort": "auto",
  "verbosity": "auto",
  "enable_web_search": false,
  "request_images": false,
  "request_image_aspect_ratio": "",
  "request_image_resolution": "",
  "n": 1,
  "bind_preset_to_connection": true,
  "extensions": {}
}
```
