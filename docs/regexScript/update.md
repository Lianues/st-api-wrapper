# regexScript.update

## 描述

更新现有正则脚本。支持增量更新（只需要传入需要修改的字段）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 脚本 ID。 |
| scope | RegexScope | 否 | 作用域。如果不传，则按 全局->角色->预设 顺序查找。 |
| regexScript | Partial\<RegexScriptData\> | 是 | 要更新的字段。支持 `name`, `enabled`, `targets`, `view`, `findRegex`, `replaceRegex`, `trimRegex`, `runOnEdit`, `macroMode`, `minDepth`, `maxDepth`, `other`。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否成功。 |
| regexScript | RegexScriptData | 更新后的完整脚本数据。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.regexScript.update({
  id: "bea00e49-03d4-4885-889e-34c3eaddbe2b",
  regexScript: {
    enabled: false,
    targets: ["aiOutput"]
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
    "enabled": false,
    "findRegex": "<([a-zA-Z0-9]+)>(.|\\n)*?</\\1>",
    "replaceRegex": "移除xml",
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
