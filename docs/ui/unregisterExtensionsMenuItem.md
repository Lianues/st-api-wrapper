# ui.unregisterExtensionsMenuItem

## 描述

注销并移除通过 `ui.registerExtensionsMenuItem` 注册的扩展菜单项。

该 API 会从酒馆左下角"魔法棒"图标触发的 **扩展菜单** (`#extensionsMenu`) 中移除指定的菜单项。

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
await ST_API.ui.registerExtensionsMenuItem({
  id: "my-plugin.action",
  label: "一键清理",
  icon: "fa-solid fa-broom",
  onClick: () => {
    console.log("清理操作已触发");
  }
});

// 稍后注销该菜单项
await ST_API.ui.unregisterExtensionsMenuItem({
  id: "my-plugin.action"
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

- [ui.registerExtensionsMenuItem](./registerExtensionsMenuItem.md) - 注册扩展菜单项
