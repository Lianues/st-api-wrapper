# ui.unregisterTopSettingsDrawer

## 描述

注销并移除通过 `ui.registerTopSettingsDrawer` 注册的顶部设置抽屉面板。

该 API 会：
1. 从 DOM 中移除对应的 drawer 元素
2. 调用注册时提供的清理函数（如果存在）
3. 从内部注册表中删除记录

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 要注销的面板 ID（与注册时使用的 ID 相同）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 操作是否成功，始终返回 `true`。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 先注册一个面板
await ST_API.ui.registerTopSettingsDrawer({
  id: "my-plugin.temp-panel",
  icon: "fa-solid fa-clock fa-fw",
  title: "临时面板",
  content: {
    kind: "html",
    html: "<p>这是一个临时面板</p>"
  }
});

// 稍后注销该面板
await ST_API.ui.unregisterTopSettingsDrawer({
  id: "my-plugin.temp-panel"
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
2. **幂等操作**：即使面板不存在，该操作也会返回成功，不会抛出错误。
3. **清理函数**：如果注册时使用了 `render` 方式并返回了清理函数，该函数会在注销时自动调用。

## 相关 API

- [ui.registerTopSettingsDrawer](./registerTopSettingsDrawer.md) - 注册顶部设置抽屉
