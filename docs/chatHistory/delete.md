# chatHistory.delete

## 描述

删除聊天记录中指定索引的消息。该操作是物理删除，会立即触发酒馆的保存逻辑。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| index | number | 要删除的消息索引。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否删除成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const history = await ST_API.chatHistory.list();
const lastIdx = history.messages.length - 1;

if (lastIdx >= 0) {
  const res = await ST_API.chatHistory.delete({ index: lastIdx });
  if (res.success) {
    console.log('成功删除了最新的一条消息');
  }
}
```

## 响应示例

```json
{
  "success": true
}
```
