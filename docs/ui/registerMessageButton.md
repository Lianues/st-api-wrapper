# ui.registerMessageButton

## 描述

在每条聊天消息的操作按钮区域（与 Edit 按钮同级）注册一个自定义按钮。

该 API 会：
1. 为所有现有消息添加按钮
2. 自动为新添加的消息添加按钮（通过 MutationObserver 监听）

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 唯一 ID（建议使用 `插件名.按钮名` 格式）。 |
| icon | string | 是 | FontAwesome 图标类名，例如 `fa-solid fa-star`。 |
| title | string | 是 | 鼠标悬停提示文本。 |
| index | number | 否 | 插入位置，从左到右从 0 开始计数（0 为最左侧，默认追加到 Edit 按钮之后）。 |
| onClick | function | 是 | 点击回调函数，接收 `(mesId, messageElement)` 参数。 |

### onClick 回调参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| mesId | number | 消息 ID（`mesid` 属性值，从 0 开始）。 |
| messageElement | HTMLElement | 消息元素（`.mes`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 注册的按钮 ID。 |
| appliedCount | number | 当前已添加按钮的消息数量。 |

---

## 示例

### 代码示例 (TypeScript)

#### 1. 注册一个收藏按钮

```typescript
const result = await ST_API.ui.registerMessageButton({
  id: "my-plugin.favorite",
  icon: "fa-solid fa-star",
  title: "收藏此消息",
  onClick: (mesId, messageElement) => {
    console.log(`收藏消息 #${mesId}`);
    // 可以通过 messageElement 获取消息内容
    const content = messageElement.querySelector('.mes_text')?.textContent;
    console.log('消息内容:', content);
  }
});

console.log(`已为 ${result.appliedCount} 条消息添加按钮`);
```

#### 2. 指定按钮位置

```typescript
// 插入到第一个位置（Edit 按钮之后的最左侧）
await ST_API.ui.registerMessageButton({
  id: "my-plugin.action",
  icon: "fa-solid fa-bolt",
  title: "快速操作",
  index: 0,
  onClick: async (mesId) => {
    // 执行某些操作
    await doSomething(mesId);
  }
});
```

#### 3. 复制消息内容

```typescript
await ST_API.ui.registerMessageButton({
  id: "my-plugin.copy-raw",
  icon: "fa-solid fa-clipboard",
  title: "复制原始内容",
  onClick: (mesId, messageElement) => {
    const mesText = messageElement.querySelector('.mes_text');
    if (mesText) {
      navigator.clipboard.writeText(mesText.innerHTML);
      alert('已复制 HTML 内容');
    }
  }
});
```

### 响应示例

```json
{
  "id": "my-plugin.favorite",
  "appliedCount": 15
}
```

---

## 注意事项

1. **ID 唯一性**：确保 `id` 在整个应用中唯一，建议使用 `插件名.按钮名` 的命名格式。
2. **自动应用**：注册后会自动为所有现有消息添加按钮，并监听新消息自动添加。
3. **图标类名**：使用 FontAwesome 图标类名。
4. **mesId**：对应消息元素的 `mesid` 属性，与聊天历史数组索引一致。

## 相关 API

- [ui.unregisterMessageButton](./unregisterMessageButton.md) - 注销消息按钮
