# regexScript.get

## 描述

获取**单个**正则脚本的完整内容（按脚本 `id` 或脚本 `name` 查找）。

> 如需列出脚本列表（按作用域筛选），请使用 `regexScript.list()`。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| idOrName | string | 是 | 脚本 ID 或脚本名称。 |
| scope | RegexScope | 否 | 限定作用域：`global` / `character` / `preset`。不传则按 `global -> character -> preset` 顺序查找第一个匹配项。 |
| allowedOnly | boolean | 否 | 仅返回已启用的脚本 (默认: `false`)。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| regexScript | RegexScriptData \| null | 单个脚本内容，找不到则为 null。 |
| scope | RegexScope \| null | 脚本所在作用域，找不到则为 null。 |

### RegexScriptData 常用字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 唯一标识符。 |
| name | string | 脚本名称（对应原始的 `scriptName`）。 |
| enabled | boolean | 是否启用（与原始的 `disabled` 相反）。 |
| findRegex | string | 查找正则。 |
| replaceRegex | string | 替换文本（对应原始的 `replaceString`）。 |
| trimRegex | string[] | 修剪文本列表（对应原始的 `trimStrings`）。 |
| targets | string[] | 作用位置列表。可选：`userInput`, `aiOutput`, `slashCommands`, `worldBook`, `reasoning`。 |
| view | string[] | 视图过滤列表。`user` (仅显示), `model` (仅发送给AI)。不传/为空表示全部生效。 |
| runOnEdit | boolean | 是否在编辑时运行。 |
| macroMode | string | 宏替换模式。详细规则见下方 [Macro Mode 详细说明](#macro-mode-详细说明)。 |
| minDepth | number? | 最小深度。 |
| maxDepth | number? | 最大深度。 |

#### Macro Mode 详细说明

该字段决定了脚本在运行正则匹配前，如何处理文本中的 SillyTavern 宏（如 `{{char}}`, `{{user}}` 等）。

| 模式 | 值 | 说明 |
| --- | --- | --- |
| **不替换** | `none` | 宏将被忽略，正则引擎将其视为普通字符串（字面意思）处理。 |
| **原始** | `raw` | 先将宏替换为其对应的值，然后再执行正则。注意：如果宏的值包含正则特殊字符（如 `.` `*` `?`），可能会改变正则的匹配行为。 |
| **转义** | `escaped` | 先将宏替换为其对应的值，并在每个字符前添加转义斜杠 `\`。这确保了宏的内容始终被视为普通文本，不会破坏正则序列。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 1) 按名称获取（不指定 scope，按 global -> character -> preset 查找）
const res = await ST_API.regexScript.get({ idOrName: "Remove XML Tags" });
console.log("scope:", res.scope);
console.log("regexScript:", res.regexScript);

// 2) 按 ID 获取，并限定作用域
const byId = await ST_API.regexScript.get({
  idOrName: "bea00e49-03d4-4885-889e-34c3eaddbe2b",
  scope: "global"
});
```

### 响应示例

```json
{
  "scope": "global",
  "regexScript": {
    "id": "bea00e49-03d4-4885-889e-34c3eaddbe2b",
    "name": "Remove XML Tags",
    "enabled": true,
    "findRegex": "<([a-zA-Z0-9]+)>(.|\\n)*?</\\1>",
    "replaceRegex": "",
    "trimRegex": [],
    "targets": ["aiOutput"],
    "view": ["user"],
    "runOnEdit": true,
    "macroMode": "none",
    "minDepth": null,
    "maxDepth": null
  }
}
```
