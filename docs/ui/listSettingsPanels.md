# ui.listSettingsPanels

## 描述

列出当前由 ST_API 注册并管理的所有自定义设置面板。

> 注意：此 API 仅返回通过 `ui.registerSettingsPanel` 注册的动态面板，不包含酒馆原生内置的扩展面板。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| target | SettingsPanelTarget | 否 | 筛选挂载目标。可选：`left` (左侧列), `right` (右侧列)。如果不传则列出所有已注册面板。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| panels | object[] | 已注册面板的简要信息列表。 |

### 面板对象结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 面板唯一 ID。 |
| title | string | 面板标题。 |
| order | number | 排序权重。 |
| target | string | 实际挂载的目标选择器。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 获取所有已注册的面板
const result = await ST_API.ui.listSettingsPanels();
console.log(`当前已注册 ${result.panels.length} 个自定义面板`);

// 获取右侧列的面板
const rightPanels = await ST_API.ui.listSettingsPanels({ target: 'right' });
console.log("右侧列面板 ID 列表:", rightPanels.panels.map(p => p.id));
```

### 响应示例

```json
{
  "panels": [
    {
      "id": "my-plugin.settings",
      "title": "我的插件设置",
      "order": 10,
      "target": "#extensions_settings2"
    }
  ]
}
```
