# ui.unregisterOptionsMenuItem

## 描述

注销并移除通过 `ui.registerOptionsMenuItem` 注册的选项菜单项。

该 API 会从聊天框左侧操作区（"三横线"图标）触发的 **选项菜单** (`#options_button`) 中移除指定的菜单项。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 要注销的菜单项 ID（与注册时使用的 ID 相同）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 操作是否成功，始终返回 `true`。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 先注册一个菜单项
await ST_API.ui.registerOptionsMenuItem({
  id: "my-plugin.config",
  label: "快速设置",
  icon: "fa-solid fa-sliders",
  onClick: () => {
    alert("快速设置面板");
  }
});

// 稍后注销该菜单项
await ST_API.ui.unregisterOptionsMenuItem({
  id: "my-plugin.config"
});
```

### 响应示例

```json
{
  "ok": true
}
```

---

## 注意事项

1. **ID 匹配**：传入的 `id` 必须与注册时使用的 ID 完全一致。
2. **幂等操作**：即使菜单项不存在，该操作也会返回成功，不会抛出错误。

## 相关 API

- [ui.registerOptionsMenuItem](./registerOptionsMenuItem.md) - 注册选项菜单项
