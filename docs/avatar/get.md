# avatar.get

获取单个头像，返回 URL 和 Base64 两种格式。

## 输入参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| type | 'character' \| 'user' | ✅ | 头像类型 |
| name | string | ❌ | 头像名称（不需要 `.png` 后缀）。如不提供，则获取当前角色/当前用户的头像。注：实际的名称不等于显示的名称，请通过list函数查看头像文件实际的名称 |

## 输出

| 属性 | 类型 | 说明 |
|------|------|------|
| type | 'character' \| 'user' | 头像类型 |
| name | string | 头像名称（不含 `.png` 后缀） |
| url | string | 完整头像 URL（相对路径） |
| thumbnailUrl | string | 缩略图 URL（加载更快） |
| base64 | string | 完整图片的 Base64 格式数据 |
| thumbnailBase64 | string | 缩略图的 Base64 格式数据 |
| isCurrent | boolean | 是否是当前选中的头像 |

## 示例

### 获取指定角色头像

```typescript
const avatar = await window.ST_API.avatar.get({
  type: 'character',
  name: 'Alice'
});

console.log('头像 URL:', avatar.url);       // "characters/Alice.png"
console.log('Base64:', avatar.base64);      // "data:image/png;base64,..."
console.log('是否当前:', avatar.isCurrent); // false
```

### 获取当前对话角色头像

```typescript
// 不提供 name，自动获取当前角色
const avatar = await window.ST_API.avatar.get({
  type: 'character',
});

console.log('头像 URL:', avatar.url);       // "characters/Alice.png"
console.log('Base64:', avatar.base64);      // "data:image/png;base64,..."

```

### 获取指定用户头像

```typescript
const avatar = await window.ST_API.avatar.get({
  type: 'user',
  name: 'MyAvatar'
});

console.log('头像 URL:', avatar.url);       // "User Avatars/MyAvatar.png"
```

### 获取当前用户头像

```typescript
// 不提供 name，自动获取当前用户头像
const avatar = await window.ST_API.avatar.get({
  type: 'user'
});

console.log('用户头像:', avatar.name);
console.log('是否当前:', avatar.isCurrent); // true
```

### 在 HTML 中使用

```typescript
const avatar = await window.ST_API.avatar.get({ type: 'character', name: 'Alice' });

// 使用 URL
document.getElementById('img1').src = avatar.url;

// 使用 Base64（可离线使用）
document.getElementById('img2').src = avatar.base64;

// 使用缩略图（加载更快）
document.getElementById('img3').src = avatar.thumbnailUrl;
```

## 错误处理

| 错误信息 | 原因 |
|----------|------|
| `type is required` | 未提供 type 参数 |
| `No character selected in current chat` | 未提供 name 且当前没有选择角色 |
| `No user avatar found` | 未提供 name 且当前没有用户头像 |

```typescript
try {
  const avatar = await window.ST_API.avatar.get({ type: 'character' });
} catch (error) {
  console.error('获取头像失败:', error.message);
}
```

## 注意事项

1. **自动添加后缀**：传入的名称会自动添加 `.png` 后缀（如果没有的话）。
2. **Base64 加载**：Base64 从完整图片获取，如果图片不存在会返回空字符串。
3. **路径格式**：
   - `url`（完整图片）：
     - 角色头像：`characters/{name}.png`
     - 用户头像：`User Avatars/{name}.png`
   - `thumbnailUrl`（缩略图，加载更快）：
     - 角色头像：`/thumbnail?type=avatar&file={name}.png`
     - 用户头像：`/thumbnail?type=persona&file={name}.png`

## 相关 API

- [avatar.list](./list.md)：批量获取头像列表
