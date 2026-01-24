# regexScript.run

## 描述

运行特定的正则脚本来处理文本。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| idOrName | string | 是 | 脚本 ID 或脚本名称。 |
| text | string | 是 | 要处理的文本。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| text | string | 处理后的文本。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.regexScript.run({
  idOrName: "Remove XML Tags",
  text: "<thought>这是一段思考过程</thought> 这是正文。"
});

console.log("处理后:", result.text); // " 这是正文。"
```

### 响应示例

```json
{
  "text": " 这是正文。"
}
```
