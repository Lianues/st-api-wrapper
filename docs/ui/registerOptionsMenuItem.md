# ui.registerOptionsMenuItem

## 描述

在聊天框左侧操作区（“三横线”图标）触发的 **选项菜单** (`#options_button`) 中注册一个自定义功能链接。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 唯一 ID，用于避免冲突。 |
| label | string | 是 | 显示的文本。 |
| icon | string | 是 | 图标的 CSS 类名 (FontAwesome)，例如 `fa-solid fa-gear`。 |
| index | number | 否 | 插入位置 (0 为最顶端)。默认追加到末尾。 |
| onClick | function | 是 | 点击链接时的回调函数。支持异步。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| itemId | string | 创建成功的 DOM 元素实际 ID。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.ui.registerOptionsMenuItem({
  id: "my-plugin.config",
  label: "快速设置",
  icon: "fa-solid fa-sliders",
  onClick: () => {
    alert("快速设置面板");
  }
});
```

### 响应示例

```json
{
  "itemId": "my-plugin_config"
}
```

## 相关 API

- [ui.unregisterOptionsMenuItem](./unregisterOptionsMenuItem.md) - 注销选项菜单项
