# ui.registerExtensionsMenuItem

## 描述

在酒馆左下角“魔法棒”图标触发的 **扩展菜单** (`#extensionsMenu`) 中注册一个自定义操作按钮。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 唯一 ID，用于避免冲突。 |
| label | string | 是 | 按钮显示的文本。 |
| icon | string | 是 | 图标的 CSS 类名 (FontAwesome)，例如 `fa-solid fa-magic`。 |
| index | number | 否 | 插入位置 (0 为最顶端)。默认追加到末尾。 |
| onClick | function | 是 | 点击按钮时的回调函数。支持异步。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| itemId | string | 创建成功的 DOM 元素实际 ID。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.ui.registerExtensionsMenuItem({
  id: "my-plugin.action",
  label: "一键清理",
  icon: "fa-solid fa-broom",
  onClick: () => {
    console.log("清理操作已触发");
  }
});

console.log("已创建菜单项 ID:", result.itemId);
```

### 响应示例

```json
{
  "itemId": "my-plugin_action"
}
```

## 相关 API

- [ui.unregisterExtensionsMenuItem](./unregisterExtensionsMenuItem.md) - 注销扩展菜单项
