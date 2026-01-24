# regexScript.list

## 描述

列出正则脚本列表。支持按作用域（全局、角色、预设）进行筛选。返回的数据采用了经过整理的友好结构。

> 如果你只想读取某一个脚本的完整内容（按 ID 或名称），请使用 `regexScript.get()`。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| allowedOnly | boolean | 否 | 仅返回已启用的脚本 (默认: `false`)。 |
| includeGlobal | boolean | 否 | 是否包含全局脚本 (默认: `true`)。 |
| includeCharacter | boolean | 否 | 是否包含角色专用脚本 (默认: `true`)。 |
| includePreset | boolean | 否 | 是否包含预设专用脚本 (默认: `true`)。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| regexScripts | RegexScriptData[] | 正则脚本列表。 |

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
| macroMode | string | 宏替换模式。 |
| minDepth | number? | 最小深度。 |
| maxDepth | number? | 最大深度。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.regexScript.list({
  allowedOnly: true,
  includeGlobal: true
});

console.log(`获取到 ${result.regexScripts.length} 个启用的脚本`);
```

### 响应示例

```json
{
  "regexScripts": [
    {
      "id": "82aff7dc-d05f-4e10-bee9-dafcf3c7b8b0",
      "name": "测试脚本",
      "enabled": true,
      "findRegex": "查找正则",
      "replaceRegex": "替换为",
      "trimRegex": [],
      "targets": ["userInput", "aiOutput"],
      "view": ["user"],
      "runOnEdit": true,
      "macroMode": "none",
      "minDepth": null,
      "maxDepth": null
    }
  ]
}
```

