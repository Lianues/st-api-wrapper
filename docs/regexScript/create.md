# regexScript.create

## 描述

创建一个新的正则脚本。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| scope | RegexScope | 否 | 作用域：`global` (默认), `character`, `preset`。 |
| regexScript | Partial\<RegexScriptData\> | 是 | 正则脚本数据。 |

### regexScript 常用字段

详见 [regexScript.get](./get.md) 中的常用字段说明及 [Macro Mode 详细说明](./get.md#macro-mode-详细说明)。

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否成功。 |
| regexScript | RegexScriptData | 创建成功的完整脚本数据。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.regexScript.create({
  scope: "global",
  regexScript: {
    name: "Remove XML Tags",
    enabled: true,
    targets: ["userInput", "aiOutput"],
    view: ["user"],
    findRegex: "<([a-zA-Z0-9]+)>(.|\\n)*?</\\1>",
    replaceRegex: "移除xml",
    macroMode: "none"
  }
});
```

### 响应示例

```json
{
  "success": true,
  "regexScript": {
    "id": "bea00e49-03d4-4885-889e-34c3eaddbe2b",
    "name": "Remove XML Tags",
    "enabled": true,
    "findRegex": "<([a-zA-Z0-9]+)>(.|\\n)*?</\\1>",
    "replaceRegex": "移除xml",
    "trimRegex": [],
    "targets": ["userInput", "aiOutput"],
    "view": ["user"],
    "runOnEdit": true,
    "macroMode": "none",
    "minDepth": null,
    "maxDepth": null
  }
}
```
