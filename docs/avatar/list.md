# avatar.list

批量获取头像列表，支持按类型过滤。

## 输入参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| type | 'character' \| 'user' \| 'all' | ✅ | 要获取的头像类型 |
| includeFullBase64 | boolean | ❌ | 是否返回完整图片的 Base64（默认 `false`） |

### type 参数说明

| 值 | 说明 |
|----|------|
| `'character'` | 仅获取角色头像 |
| `'user'` | 仅获取用户头像 |
| `'all'` | 获取所有头像 |

## 输出

| 属性 | 类型 | 说明 |
|------|------|------|
| characters | AvatarOutput[] | 角色头像列表 |
| users | AvatarOutput[] | 用户头像列表 |
| total | number | 总数量 |

### AvatarOutput 结构

| 属性 | 类型 | 说明 |
|------|------|------|
| type | 'character' \| 'user' | 头像类型 |
| name | string | 头像名称（不含 `.png` 后缀） |
| url | string | 完整头像 URL（相对路径） |
| thumbnailUrl | string | 缩略图 URL |
| base64 | string | 完整图片的 Base64 格式数据 |
| thumbnailBase64 | string | 缩略图的 Base64 格式数据 |
| isCurrent | boolean | 是否是当前选中的头像 |

## 示例

### 获取所有角色头像

```typescript
const result = await window.ST_API.avatar.list({
  type: 'character'
});

console.log('角色头像数量:', result.characters.length);
result.characters.forEach(avatar => {
  console.log(`${avatar.name}: ${avatar.url}`);
  if (avatar.isCurrent) {
    console.log('  ^ 当前选中的角色');
  }
});
```

### 获取所有用户头像

```typescript
const result = await window.ST_API.avatar.list({
  type: 'user'
});

console.log('用户头像数量:', result.users.length);
result.users.forEach(avatar => {
  console.log(`${avatar.name}: ${avatar.url}`);
});
```

### 获取所有头像

```typescript
const result = await window.ST_API.avatar.list({
  type: 'all'
});

console.log('总头像数量:', result.total);
console.log('角色头像:', result.characters.length);
console.log('用户头像:', result.users.length);
```

### 查找当前选中的头像

```typescript
const result = await window.ST_API.avatar.list({ type: 'all' });

const currentCharacter = result.characters.find(a => a.isCurrent);
const currentUser = result.users.find(a => a.isCurrent);

if (currentCharacter) {
  console.log('当前角色:', currentCharacter.name);
}
if (currentUser) {
  console.log('当前用户:', currentUser.name);
}
```

### 构建头像选择器

```typescript
const result = await window.ST_API.avatar.list({ type: 'character' });

const container = document.getElementById('avatar-selector');
result.characters.forEach(avatar => {
  const img = document.createElement('img');
  img.src = avatar.thumbnailUrl;
  img.alt = avatar.name;
  img.title = avatar.name;
  img.className = avatar.isCurrent ? 'selected' : '';
  img.onclick = () => selectCharacter(avatar.name);
  container.appendChild(img);
});
```

### 获取包含完整 Base64 的列表

```typescript
// 需要完整图片时，设置 includeFullBase64: true
const result = await window.ST_API.avatar.list({
  type: 'character',
  includeFullBase64: true
});

// 此时 base64 字段包含完整图片
console.log('完整Base64长度:', result.characters[0]?.base64.length);
```

## 注意事项

1. **性能考虑**：默认只返回缩略图 Base64（`thumbnailBase64`），`base64` 为空字符串。设置 `includeFullBase64: true` 会返回完整图片，但会增加加载时间。
2. **isCurrent 标记**：每种类型最多只有一个头像的 `isCurrent` 为 `true`。
3. **空列表**：如果指定类型没有头像，对应数组为空。

## 相关 API

- [avatar.get](./get.md)：获取单个头像
