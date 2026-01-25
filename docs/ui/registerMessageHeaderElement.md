# ui.registerMessageHeaderElement

在消息标题区域（角色名、幽灵图标、时间戳所在区域）注册自定义元素。

## 消息标题区域结构

```html
<div class="flex-container alignItemsBaseline">
    <span class="name_text">Assistant</span>
    <i class="mes_ghost fa-solid fa-ghost" title="..."></i>
    <small class="timestamp">January 25, 2026 2:31 PM</small>
    <!-- 自定义元素可以插入到这里 -->
</div>
```

## 输入参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 唯一 ID（建议使用 `插件名.元素名` 格式） |
| position | MessageHeaderPosition | ❌ | 插入位置，见下方说明（默认 `'afterName'`） |
| roleFilter | MessageRoleFilter | ❌ | 角色过滤器（默认 `'all'`） |
| filter | (context) => boolean | ❌ | 自定义过滤函数 |
| render | (context) => HTMLElement \| null | ✅ | 渲染函数 |

### position 参数

| 值 | 说明 |
|----|------|
| `'afterName'` | 在角色名 `.name_text` 之后（默认） |
| `'beforeTimestamp'` | 在时间戳 `.timestamp` 之前 |
| `'afterTimestamp'` | 在时间戳 `.timestamp` 之后 |
| `number` | 从左到右的索引位置（0 为最左侧） |

### roleFilter 参数

| 值 | 说明 |
|----|------|
| `'user'` | 仅在用户消息显示 |
| `'assistant'` | 仅在助手消息显示 |
| `'system'` | 仅在系统消息显示 |
| `'all'` | 在所有消息显示（默认） |

### MessageContext 消息上下文

`render` 和 `filter` 函数接收的上下文对象：

| 属性 | 类型 | 说明 |
|------|------|------|
| mesId | number | 消息 ID（`mesid` 属性值） |
| role | 'user' \| 'assistant' \| 'system' | 消息角色 |
| characterName | string | 角色名称（`ch_name` 属性值） |
| isUser | boolean | 是否是用户消息 |
| isSystem | boolean | 是否是系统消息 |
| messageElement | HTMLElement | 消息元素（`.mes`） |

## 输出

| 属性 | 类型 | 说明 |
|------|------|------|
| id | string | 注册的元素 ID |
| appliedCount | number | 当前已添加元素的消息数量 |

## 示例

### 基本用法 - 添加消息标签

```typescript
const result = await window.ST_API.ui.registerMessageHeaderElement({
  id: 'my-plugin.message-tag',
  position: 'afterName',
  render: (context) => {
    const tag = document.createElement('span');
    tag.className = 'mes_tag';
    tag.style.cssText = 'margin-left: 5px; font-size: 0.8em; color: #888;';
    tag.textContent = `#${context.mesId}`;
    return tag;
  }
});
console.log(`已添加到 ${result.appliedCount} 条消息`);
```

### 仅为用户消息添加元素

```typescript
await window.ST_API.ui.registerMessageHeaderElement({
  id: 'my-plugin.user-badge',
  position: 'afterName',
  roleFilter: 'user',
  render: (context) => {
    const badge = document.createElement('span');
    badge.className = 'user-badge';
    badge.textContent = '👤';
    badge.title = '用户消息';
    return badge;
  }
});
```

### 仅为助手消息添加带条件的元素

```typescript
await window.ST_API.ui.registerMessageHeaderElement({
  id: 'my-plugin.ai-indicator',
  position: 'beforeTimestamp',
  roleFilter: 'assistant',
  filter: (context) => {
    // 仅在前 5 条消息显示
    return context.mesId < 5;
  },
  render: (context) => {
    const indicator = document.createElement('i');
    indicator.className = 'fa-solid fa-robot';
    indicator.style.marginRight = '5px';
    indicator.title = `AI 回复 - ${context.characterName}`;
    return indicator;
  }
});
```

### 添加可交互元素

```typescript
await window.ST_API.ui.registerMessageHeaderElement({
  id: 'my-plugin.copy-id-btn',
  position: 'afterTimestamp',
  render: (context) => {
    const btn = document.createElement('button');
    btn.className = 'mes_header_btn';
    btn.style.cssText = 'margin-left: 5px; font-size: 0.7em; cursor: pointer;';
    btn.textContent = '📋';
    btn.title = '复制消息 ID';
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(String(context.mesId));
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = '📋', 1000);
    });
    
    return btn;
  }
});
```

### 使用索引位置

```typescript
// 在最左侧（索引 0）插入
await window.ST_API.ui.registerMessageHeaderElement({
  id: 'my-plugin.first-element',
  position: 0,
  render: () => {
    const el = document.createElement('span');
    el.textContent = '🔹';
    return el;
  }
});
```

### 根据消息内容动态渲染

```typescript
await window.ST_API.ui.registerMessageHeaderElement({
  id: 'my-plugin.content-indicator',
  position: 'afterName',
  render: (context) => {
    // 检查消息是否包含代码块
    const mesText = context.messageElement.querySelector('.mes_text');
    const hasCode = mesText?.querySelector('pre, code');
    
    if (!hasCode) return null; // 返回 null 不显示元素
    
    const badge = document.createElement('span');
    badge.className = 'code-indicator';
    badge.textContent = '💻';
    badge.title = '包含代码';
    return badge;
  }
});
```

## 注意事项

1. **ID 唯一性**：每个 ID 只能注册一次，重复注册会抛出错误。
2. **动态更新**：新添加的消息会自动应用已注册的元素（通过 MutationObserver）。
3. **返回 null**：`render` 函数返回 `null` 时，该消息不会添加元素。
4. **事件处理**：如果元素需要处理点击事件，建议使用 `e.stopPropagation()` 防止事件冒泡。
5. **样式建议**：建议添加 `margin-left` 或 `margin-right` 以保持与其他元素的间距。

## 相关 API

- [ui.unregisterMessageHeaderElement](./unregisterMessageHeaderElement.md)：注销消息标题区域元素
- [ui.registerMessageButton](./registerMessageButton.md)：注册消息操作按钮
