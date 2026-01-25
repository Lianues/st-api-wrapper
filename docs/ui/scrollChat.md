# ui.scrollChat

## 描述

滚动聊天记录到指定位置。支持滚动到顶部、底部或指定消息。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| behavior | string | 否 | 滚动行为：`'smooth'`（平滑，默认）或 `'instant'`（立即）。 |
| target | string \| number | 否 | 滚动目标：`'bottom'`（底部，默认）、`'top'`（顶部）或消息 ID（mesid）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 操作是否成功。 |
| scrollTop | number | 滚动后的位置（像素）。 |

---

## 示例

### 代码示例 (TypeScript)

#### 1. 滚动到底部（默认）

```typescript
// 平滑滚动到底部
await ST_API.ui.scrollChat();

// 或显式指定
await ST_API.ui.scrollChat({
  target: 'bottom',
  behavior: 'smooth'
});
```

#### 2. 立即滚动到顶部

```typescript
await ST_API.ui.scrollChat({
  target: 'top',
  behavior: 'instant'
});
```

#### 3. 滚动到指定消息

```typescript
// 滚动到 mesid=5 的消息
await ST_API.ui.scrollChat({
  target: 5,
  behavior: 'smooth'
});
```

#### 4. 配合消息创建使用

```typescript
// 创建消息后滚动到底部
await ST_API.chatHistory.create({
  role: 'user',
  content: '你好！'
});

// 等待渲染完成后滚动
setTimeout(async () => {
  await ST_API.ui.scrollChat({ target: 'bottom' });
}, 100);
```

### 响应示例

```json
{
  "ok": true,
  "scrollTop": 1234
}
```

---

## 注意事项

1. **消息 ID**：`target` 为数字时，对应消息元素的 `mesid` 属性（从 0 开始）。
2. **滚动行为**：`'smooth'` 会有动画效果，`'instant'` 立即跳转。
3. **消息不存在**：如果指定的消息 ID 不存在，返回 `{ ok: false }`。

## 相关 API

- [ui.reloadChat](./reloadChat.md) - 重载聊天界面
