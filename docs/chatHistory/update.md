# chatHistory.update

## 描述

修改聊天记录中指定索引的消息。成功后返回更新后的完整消息对象。
支持修改消息的角色、名称、文本内容以及多模态附件。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| index | number | 消息索引。 |
| role | 'user' \| 'model' \| 'system' | (可选) 修改角色。 |
| content | string \| MessagePart[] | (可选) 修改内容。支持 `MessagePart[]` (Gemini 风格)。 |
| name | string | (可选) 修改发送者名称。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| message | ChatMessage | 修改后的完整归一化消息对象。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const res = await ST_API.chatHistory.update({
  index: 10,
  content: [
    { text: "我把图片换了" },
    { fileData: { mimeType: 'image/jpeg', fileUri: '/user/images/new.jpg' } }
  ]
});

// 直接从响应中获取更新后的状态
console.log('修改后的消息角色:', res.message.role);
```

## 响应示例

```json
{
  "message": {
    "role": "model",
    "name": "浅野 响子",
    "parts": [
      { "text": "我把图片换了" },
      {
        "fileData": {
          "mimeType": "image/jpeg",
          "fileUri": "/user/images/new.jpg"
        }
      }
    ],
    "swipeId": 0
  }
}
```
