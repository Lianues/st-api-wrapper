# file.upload

## 描述

将文件（Base64 格式）上传到酒馆服务器。支持任何文件类型。
- **覆盖行为**：如果指定的目录下已存在同名文件，将会被覆盖。
- **角色目录支持**：可以一键将文件上传到当前活跃角色的专属目录下。

## 输入

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| data | string | - | 文件的 Base64 内容（支持带 `data:image/xxx;base64,` 标头，系统会自动剥离）。 |
| format | string | - | 文件后缀名（如 `png`, `pdf`, `txt`）。 |
| fileName | string | - | 存储的文件名（不含后缀）。 |
| chName | string | 'uploads' | 存储的文件夹名称（若 `useCharacterDir` 为 true 则此字段无效）。 |
| useCharacterDir | boolean | false | 是否自动上传到当前活跃角色的目录中。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| path | string | 上传成功后的服务器相对路径（如 `/user/images/角色名/文件名.png`）。 |

## 示例

### 代码示例 (TypeScript)

```typescript
// 1. 上传一个文本文件到当前角色的目录下
const res = await ST_API.file.upload({
  data: "SGVsbG8gV29ybGQ=", // "Hello World" 的 Base64
  format: "txt",
  fileName: "my_note",
  useCharacterDir: true
});

console.log('文件已保存到:', res.path);

// 2. 上传一个图片并指定文件夹
await ST_API.file.upload({
  data: "data:image/png;base64,iVBOR...", 
  format: "png",
  fileName: "cover",
  chName: "my_assets"
});
```

## 响应示例

```json
{
  "path": "/user/images/浅野 响子/my_note.txt"
}
```
