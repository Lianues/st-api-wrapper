# ui.unregisterMessageHeaderElement

注销通过 `registerMessageHeaderElement` 注册的消息标题区域元素。

## 输入参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 要注销的元素 ID（与注册时使用的 ID 相同） |

## 输出

| 属性 | 类型 | 说明 |
|------|------|------|
| ok | boolean | 是否成功（始终为 `true`） |
| removedCount | number | 移除元素的消息数量 |

## 示例

### 基本用法

```typescript
const result = await window.ST_API.ui.unregisterMessageHeaderElement({
  id: 'my-plugin.message-tag'
});
console.log(`已从 ${result.removedCount} 条消息移除元素`);
```

### 插件卸载时清理

```typescript
// 插件初始化时注册
async function initPlugin() {
  await window.ST_API.ui.registerMessageHeaderElement({
    id: 'my-plugin.custom-badge',
    render: (ctx) => {
      const badge = document.createElement('span');
      badge.textContent = '🏷️';
      return badge;
    }
  });
}

// 插件卸载时清理
async function cleanupPlugin() {
  await window.ST_API.ui.unregisterMessageHeaderElement({
    id: 'my-plugin.custom-badge'
  });
}
```

## 注意事项

1. **安全调用**：即使 ID 不存在，调用也不会抛出错误，只是 `removedCount` 为 0。
2. **DOM 清理**：所有已添加到消息中的元素会被立即移除。

## 相关 API

- [ui.registerMessageHeaderElement](./registerMessageHeaderElement.md)：在消息标题区域注册自定义元素
