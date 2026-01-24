# ui.reloadSettings

## 描述

重载设置界面并同步设置状态。该操作会执行以下动作：
1. 触发设置的后台保存。
2. 触发 `PRESET_CHANGED` 和 `SETTINGS_LOADED` 事件。
这能强制让 Regex (正则脚本) 等扩展刷新其 UI 面板的状态（如复选框选中情况）。

## 输入

无

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 当通过 API 启用了某个脚本，但 UI 没更新时调用
await ST_API.ui.reloadSettings();
```

## 响应示例

```json
{
  "ok": true
}
```
