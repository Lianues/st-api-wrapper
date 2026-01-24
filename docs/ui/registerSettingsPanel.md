# ui.registerSettingsPanel

## 描述

在酒馆「扩展设置」区域（`#extensions_settings` / `#extensions_settings2`）注册一个可折叠的自定义设置面板（inline-drawer）。

该 API 旨在简化扩展开发者的 UI 挂载流程，自动处理 `APP_READY` 时机、挂载点查找及折叠逻辑。

支持 4 种内容形式：
- **HTML 字符串** (`kind: 'html'`)
- **HTML 模板** (`kind: 'htmlTemplate'`)：兼容酒馆官方示例格式。
- **DOM 元素** (`kind: 'element'`)
- **Render 函数** (`kind: 'render'`)：支持完全自定义的渲染及清理逻辑。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 唯一 ID（建议使用 `插件名.模块名` 格式）。 |
| title | string | 是 | 面板标题。 |
| content | object | 是 | 渲染内容定义。 |
| target | string | 否 | 挂载位置。可选：`left` (左侧), `right` (右侧, 默认)。 |
| expanded | boolean | 否 | 是否初始展开。默认 `false`。 |
| index | number | 否 | 插入位置（0 为最顶端）。 |
| order | number | 否 | 排序权重（仅在未设置 index 时生效）。 |
| className | string | 否 | 额外添加到根容器的类名。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 面板 ID。 |
| containerId | string | 自动生成的根容器 DOM ID。 |
| drawer | HTMLElement | `.inline-drawer` 元素引用。 |
| content | HTMLElement | 内容容器元素引用。 |

---

## 示例

### 代码示例 (TypeScript)

#### 1. 使用 HTML 字符串注册简单面板

```typescript
await ST_API.ui.registerSettingsPanel({
  id: "my-plugin.basic",
  title: "基础设置",
  target: "right",
  content: {
    kind: "html",
    html: "<p>这是我的插件设置内容</p><button class='menu_button'>保存</button>"
  }
});
```

#### 2. 使用 Render 函数注册复杂面板（带清理逻辑）

```typescript
await ST_API.ui.registerSettingsPanel({
  id: "my-plugin.complex",
  title: "高级渲染面板",
  content: {
    kind: "render",
    render: (container) => {
      const btn = document.createElement('button');
      btn.textContent = "点击我";
      const handler = () => alert("点击成功");
      btn.addEventListener('click', handler);
      container.appendChild(btn);
      
      // 返回清理函数
      return () => {
        btn.removeEventListener('click', handler);
      };
    }
  }
});
```

### 响应示例

```json
{
  "id": "my-plugin.basic",
  "containerId": "my-plugin_basic_container",
  "drawer": {},
  "content": {}
}
```
