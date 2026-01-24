# file.get

## 描述

获取指定文件的内容（返回 Base64 编码）。支持通过 URL、路径参数或当前角色目录进行定位。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| url | string | (可选) 直接提供文件的服务器相对路径（如 `/user/images/default/test.png`）。 |
| chName | string | (可选) 存储文件夹名称（若 `useCharacterDir` 为 true 则被忽略）。 |
| fileName | string | (可选) 文件名（不含后缀）。 |
| format | string | (可选) 文件后缀名（如 `png`, `txt`）。 |
| useCharacterDir | boolean | (可选) 是否使用当前活跃角色的目录。 |

> 注意：如果未提供 `url`，系统将根据 `chName`/`useCharacterDir`、`fileName` 和 `format` 自动拼凑路径。

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| data | string | 文件的 Base64 内容。 |
| mimeType | string | 文件的 MIME 类型（如 `image/png`）。 |

---

## 示例

### 代码示例 (TypeScript)

#### 1. 获取当前角色目录下的指定文件

```typescript
(async () => {
  const res = await ST_API.file.get({ 
    useCharacterDir: true, 
    fileName: "1769163625971_7012193527676007", 
    format: "png" 
  });
  console.log('文件获取成功:', res);
})();
```

#### 2. 通过路径参数获取

```typescript
const res = await ST_API.file.get({
  chName: "my_assets",
  fileName: "cover",
  format: "png"
});
console.log('MIME 类型:', res.mimeType);
```

## 响应示例

```json
{
  "data": "iVB...Base64字符串...",
  "mimeType": "image/png"
}
```

比如：

```json
{
  "data": "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABWZkRUNSJJPjAOWrYpkAAABmSURBVHgB5cRjtCVn2oDh+3mravPY57RtxLYzM0kGydi2bdu2EYxi22bbPH2szap6n2/Vj7PWXr06mWimZ773x3WhqvpkGIAnwwA8GQbgyTAAT4YBeDIMwJNhAJ4MA/BkGIAn4/8Asqwn66c/i+UAAAAASUVORK5CYII=",
  "mimeType": "image/png"
}
```
