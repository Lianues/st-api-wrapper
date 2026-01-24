# ui.unregisterSettingsPanel

## 描述

卸载并移除通过 `ui.registerSettingsPanel` 注册的自定义面板。

> 如果注册时提供的 `render` 函数返回了清理函数（cleanup），该函数将在面板移除时自动执行。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 要卸载的面板 ID。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功移除。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const result = await ST_API.ui.unregisterSettingsPanel({
  id: "my-plugin.settings"
});

if (result.ok) {
  console.log("面板已移除");
}
```

### 响应示例

```json
{
  "ok": true
}
```
