# ui.registerTopSettingsDrawer

## 描述

在酒馆顶部设置区域（`#top-settings-holder`）注册一个可折叠的自定义抽屉面板（drawer）。

该 API 允许插件开发者在顶部工具栏添加类似「API 连接」面板（`#sys-settings-button`）的自定义入口，包含一个图标按钮和可展开的内容区域。

支持 3 种内容形式：
- **HTML 字符串** (`kind: 'html'`)
- **DOM 元素** (`kind: 'element'`)
- **Render 函数** (`kind: 'render'`)：支持完全自定义的渲染及清理逻辑。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 唯一 ID（建议使用 `插件名.模块名` 格式）。 |
| icon | string | 是 | FontAwesome 图标类名，例如 `fa-solid fa-cog fa-fw`。 |
| content | object | 是 | 渲染内容定义。 |
| title | string | 否 | 鼠标悬停提示文本。 |
| expanded | boolean | 否 | 是否初始展开。默认 `false`。 |
| index | number | 否 | 插入位置，从左到右从 0 开始计数（0 为最左侧，默认追加到最右侧末尾）。 |
| className | string | 否 | 额外添加到 drawer 根容器的类名。 |
| onOpen | function | 否 | 抽屉打开时的回调函数。 |
| onClose | function | 否 | 抽屉关闭时的回调函数。 |

### content 对象

```typescript
type TopSettingsDrawerContent =
  | { kind: 'html'; html: string; }
  | { kind: 'element'; element: HTMLElement; }
  | { kind: 'render'; render: (container: HTMLElement) => void | (() => void) | Promise<void | (() => void)>; };
```

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 面板 ID。 |
| drawerId | string | 自动生成的 drawer DOM ID。 |
| drawer | HTMLElement | `.drawer` 根元素引用。 |
| content | HTMLElement | `.drawer-content` 内容容器元素引用。 |
| toggle | function | 切换抽屉开关状态的方法。 |
| open | function | 打开抽屉的方法。 |
| close | function | 关闭抽屉的方法。 |

---

## 生成的 HTML 结构

```html
<!-- 关闭状态 -->
<div id="{sanitized-id}" class="drawer st-api-top-drawer">
  <div class="drawer-toggle">
    <div class="drawer-icon {icon} interactable closedIcon" 
         title="{title}" tabindex="0" role="button"></div>
  </div>
  <div class="drawer-content closedDrawer">
    <!-- 用户自定义内容 -->
  </div>
</div>

<!-- 展开状态 -->
<div id="{sanitized-id}" class="drawer st-api-top-drawer">
  <div class="drawer-toggle">
    <div class="drawer-icon {icon} interactable openIcon" 
         title="{title}" tabindex="0" role="button"></div>
  </div>
  <div class="drawer-content openDrawer">
    <!-- 用户自定义内容 -->
  </div>
</div>
```

---

## 示例

### 代码示例 (TypeScript)

#### 1. 使用 HTML 字符串注册简单面板

```typescript
const result = await ST_API.ui.registerTopSettingsDrawer({
  id: "my-plugin.top-panel",
  icon: "fa-solid fa-gear fa-fw",
  title: "我的插件设置",
  content: {
    kind: "html",
    html: `
      <h3>我的插件</h3>
      <div class="flex-container flexFlowColumn">
        <label>设置项:</label>
        <input type="text" class="text_pole" placeholder="输入内容...">
        <button class="menu_button">保存设置</button>
      </div>
    `
  }
});

// 使用返回的控制方法
result.open();   // 打开抽屉
result.close();  // 关闭抽屉
result.toggle(); // 切换状态
```

#### 2. 使用 Render 函数注册复杂面板（带清理逻辑）

```typescript
await ST_API.ui.registerTopSettingsDrawer({
  id: "my-plugin.advanced-panel",
  icon: "fa-solid fa-wand-magic-sparkles fa-fw",
  title: "高级功能",
  expanded: false,
  content: {
    kind: "render",
    render: (container) => {
      const btn = document.createElement('button');
      btn.className = 'menu_button';
      btn.textContent = "执行操作";
      
      const handler = () => {
        console.log("按钮被点击");
      };
      
      btn.addEventListener('click', handler);
      container.appendChild(btn);
      
      // 返回清理函数
      return () => {
        btn.removeEventListener('click', handler);
      };
    }
  },
  onOpen: () => console.log("面板已打开"),
  onClose: () => console.log("面板已关闭")
});
```

#### 3. 使用 DOM 元素注册面板

```typescript
const myElement = document.createElement('div');
myElement.innerHTML = `
  <h3>自定义面板</h3>
  <p>这是通过 DOM 元素创建的内容</p>
`;

await ST_API.ui.registerTopSettingsDrawer({
  id: "my-plugin.element-panel",
  icon: "fa-solid fa-puzzle-piece fa-fw",
  title: "元素面板",
  index: 0, // 插入到最左侧（从左到右，0 为第一个位置）
  content: {
    kind: "element",
    element: myElement
  }
});
```

### 响应示例

```json
{
  "id": "my-plugin.top-panel",
  "drawerId": "my-plugin_top-panel",
  "drawer": {},
  "content": {},
  "toggle": "[Function]",
  "open": "[Function]",
  "close": "[Function]"
}
```

---

## 注意事项

1. **ID 唯一性**：确保 `id` 在整个应用中唯一，建议使用 `插件名.功能名` 的命名格式。
2. **图标类名**：使用 FontAwesome 图标类名，推荐添加 `fa-fw` 确保图标宽度一致。
3. **清理逻辑**：使用 `render` 方式时，务必返回清理函数以避免内存泄漏。
4. **样式兼容**：面板内容应使用酒馆原生的 CSS 类名（如 `menu_button`、`text_pole`、`flex-container` 等）以保持视觉一致性。

## 相关 API

- [ui.unregisterTopSettingsDrawer](./unregisterTopSettingsDrawer.md) - 注销顶部设置抽屉
- [ui.registerSettingsPanel](./registerSettingsPanel.md) - 注册扩展设置面板
