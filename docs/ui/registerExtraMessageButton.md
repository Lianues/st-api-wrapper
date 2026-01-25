# ui.registerExtraMessageButton

## 描述

在每条聊天消息的扩展操作菜单（点击 `...` 按钮后展开的 `.extraMesButtons` 区域）中注册一个自定义按钮。

该 API 会：
1. 为所有现有消息添加按钮
2. 自动为新添加的消息添加按钮（通过 MutationObserver 监听）

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 唯一 ID（建议使用 `插件名.按钮名` 格式）。 |
| icon | string | 是 | FontAwesome 图标类名，例如 `fa-solid fa-star`。 |
| title | string | 是 | 鼠标悬停提示文本。 |
| index | number | 否 | 插入位置，从上到下从 0 开始计数（0 为最顶部，默认追加到末尾）。 |
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

#### 1. 注册一个分析按钮

```typescript
const result = await ST_API.ui.registerExtraMessageButton({
  id: "my-plugin.analyze",
  icon: "fa-solid fa-magnifying-glass-chart",
  title: "分析此消息",
  onClick: (mesId, messageElement) => {
    const content = messageElement.querySelector('.mes_text')?.textContent;
    console.log(`分析消息 #${mesId}:`, content);
  }
});

console.log(`已为 ${result.appliedCount} 条消息添加扩展按钮`);
```

#### 2. 插入到顶部位置

```typescript
// 插入到扩展菜单的第一个位置
await ST_API.ui.registerExtraMessageButton({
  id: "my-plugin.quick-action",
  icon: "fa-solid fa-bolt",
  title: "快速操作",
  index: 0,
  onClick: async (mesId) => {
    await performQuickAction(mesId);
  }
});
```

#### 3. 导出消息

```typescript
await ST_API.ui.registerExtraMessageButton({
  id: "my-plugin.export",
  icon: "fa-solid fa-file-export",
  title: "导出消息",
  onClick: (mesId, messageElement) => {
    const mesText = messageElement.querySelector('.mes_text');
    const name = messageElement.getAttribute('ch_name');
    const data = {
      id: mesId,
      name,
      content: mesText?.innerHTML
    };
    // 导出为 JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${mesId}.json`;
    a.click();
  }
});
```

### 响应示例

```json
{
  "id": "my-plugin.analyze",
  "appliedCount": 15
}
```

---

## 注意事项

1. **ID 唯一性**：确保 `id` 在整个应用中唯一，建议使用 `插件名.按钮名` 的命名格式。
2. **自动应用**：注册后会自动为所有现有消息添加按钮，并监听新消息自动添加。
3. **展开菜单**：按钮位于 `...` 按钮展开后的菜单中，用户需要先点击 `...` 才能看到。
4. **与 registerMessageButton 的区别**：
   - `registerMessageButton`：按钮直接显示在消息操作栏（与 Edit 同级）
   - `registerExtraMessageButton`：按钮在 `...` 展开菜单中

## 相关 API

- [ui.unregisterExtraMessageButton](./unregisterExtraMessageButton.md) - 注销扩展消息按钮
- [ui.registerMessageButton](./registerMessageButton.md) - 注册消息操作按钮
