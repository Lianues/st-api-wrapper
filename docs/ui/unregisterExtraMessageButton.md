# ui.unregisterExtraMessageButton

## 描述

注销并移除通过 `ui.registerExtraMessageButton` 注册的扩展消息按钮。

该 API 会：
1. 从所有消息的扩展菜单中移除对应的按钮
2. 从内部注册表中删除记录
3. 如果没有更多注册的消息按钮，停止 MutationObserver

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 要注销的按钮 ID（与注册时使用的 ID 相同）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 操作是否成功，始终返回 `true`。 |
| removedCount | number | 移除按钮的消息数量。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 先注册一个扩展按钮
await ST_API.ui.registerExtraMessageButton({
  id: "my-plugin.temp-feature",
  icon: "fa-solid fa-flask",
  title: "临时功能",
  onClick: (mesId) => {
    console.log(`临时功能 #${mesId}`);
  }
});

// 稍后注销该按钮
const result = await ST_API.ui.unregisterExtraMessageButton({
  id: "my-plugin.temp-feature"
});

console.log(`已从 ${result.removedCount} 条消息中移除扩展按钮`);
```

### 响应示例

```json
{
  "ok": true,
  "removedCount": 15
}
```

---

## 注意事项

1. **ID 匹配**：传入的 `id` 必须与注册时使用的 ID 完全一致。
2. **幂等操作**：即使按钮不存在，该操作也会返回成功，不会抛出错误。

## 相关 API

- [ui.registerExtraMessageButton](./registerExtraMessageButton.md) - 注册扩展消息按钮
