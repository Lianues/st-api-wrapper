# chatHistory.create

## 描述

在当前聊天记录末尾创建一条新消息。支持文本和多模态附件（图片/Base64）。
- **Base64 自动持久化**：传入 `inlineData` 格式 de Base64，接口会自动将其上传到酒馆服务器。
- **响应回显 URL**：创建成功后，响应中的 `fileUri` 将返回该图片在服务器上的持久化路径（如 `/user/images/upload_xxx.png`），而不是 Base64 字符串。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| role | 'user' \| 'model' \| 'system' | 消息角色。 |
| content | string \| MessagePart[] | 消息内容。推荐使用 `MessagePart[]` (Gemini 风格)。 |
| name | string | (可选) 发送者名称。如果不传，则根据角色自动选择当前用户或角色名。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| index | number | 新消息在聊天列表中的索引。 |
| message | ChatMessage | 创建成功的完整归一化消息对象（Gemini 格式）。 |

---

## 示例

### 代码示例 (TypeScript)

#### 1. 使用 Base64 创建图片消息 (推荐)

开发者通过 Base64 传入图片，API 自动上传并返回服务器路径。

```typescript
const res = await ST_API.chatHistory.create({
  role: 'user',
  content: [
    { text: "看看这张图" },
    { 
      inlineData: { 
        mimeType: 'image/png', 
        data: 'iVBORw0KGgoAAAANSUhEUgAA...' // 纯 Base64 数据
      } 
    }
  ]
});

console.log('新消息索引:', res.index);
const msg = res.message;
if ('parts' in msg) {
  // 注意：此处 fileUri 是服务器持久化后的路径
  // @ts-ignore
  console.log('图片服务器路径:', msg.parts[1].fileData.fileUri); 
  // 输出示例: "/user/images/upload_1769158461554.png"
}
```

#### 2. 直接使用 URL 创建消息

```typescript
await ST_API.chatHistory.create({
  role: 'model',
  content: [
    { text: "这是一张服务器上已有的图片" },
    { fileData: { mimeType: 'image/png', fileUri: '/user/images/default/test.png' } }
  ]
});
```

## 响应示例

```json
{
  "index": 42,
  "message": {
    "role": "user",
    "name": "User222",
    "parts": [
      { "text": "看看这张图" },
      {
        "fileData": {
          "mimeType": "image/png",
          "fileUri": "/user/images/upload_1769158461554.png"
        }
      }
    ],
    "swipeId": 0
  }
}
```
