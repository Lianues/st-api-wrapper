# file.list

## 描述

列出指定文件夹或当前角色目录下的所有媒体文件（图片、音频、视频等）。
该接口会扫描酒馆服务器上的物理文件并返回其相对路径。

## 输入

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| chName | string | 'uploads' | 文件夹名称（若 `useCharacterDir` 为 true 则此字段无效）。 |
| useCharacterDir | boolean | false | 是否列出当前活跃角色的专属目录。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| files | FileInfo[] | 找到的文件列表。 |

### FileInfo 结构
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 文件名（含后缀）。 |
| path | string | 服务器相对路径，可直接用于 `file.get` 或 `chatHistory`。 |
| size | number | 文件大小（字节）。**注：由于酒馆原生 bug，此处可能显示为 0。** |
| mtime | number | 最后修改时间戳。**注：由于酒馆原生 bug，此处可能显示为 0。** |

> **提示**：酒馆目前的 `/api/images/list` 接口未正确提取文件的统计信息，导致 `size` 和 `mtime` 字段通常返回 `0`。这是一个已知的酒馆底层问题。

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 列出当前角色的所有附件
const res = await ST_API.file.list({ 
  useCharacterDir: true 
});

if (res.files.length > 0) {
  console.log(`共找到 ${res.files.length} 个文件`);
  res.files.forEach(file => {
    console.log(`文件名: ${file.name}, 路径: ${file.path}`);
  });
}
```

## 响应示例

```json
{
  "files": [
    {
      "name": "1769156266417_4644195637182441.png",
      "path": "/user/images/浅野 响子/1769156266417_4644195637182441.png",
      "size": 0,
      "mtime": 0
    },
    {
      "name": "1769163171553_3745362732243176.png",
      "path": "/user/images/浅野 响子/1769163171553_3745362732243176.png",
      "size": 0,
      "mtime": 0
    },
    {
      "name": "1769164002752_736327955.mp3",
      "path": "/user/images/浅野 响子/1769164002752_736327955.mp3",
      "size": 0,
      "mtime": 0
    }
  ]
}
```
