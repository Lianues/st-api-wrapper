# file.delete

## 描述

删除服务器上的文件。如果仅指定文件夹而不指定文件名，系统将自动递归清理该文件夹下的所有文件内容。

> **关于文件夹删除**：
> 由于酒馆后端接口目前的限制（仅支持删除文件文件），本 API 不提供物理删除文件夹本身的功能。调用本接口清空文件夹后，文件夹将作为一个空目录保留在服务器磁盘上。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| url | string | (可选) 直接提供文件的服务器相对路径（如 `/user/images/default/test.png`）。 |
| chName | string | (可选) 存储文件夹名称。 |
| fileName | string | (可选) 文件名（不含后缀）。如果不传，则表示清空文件夹下的所有文件。 |
| format | string | (可选) 文件后缀名。 |
| useCharacterDir | boolean | (可选) 是否定位当前活跃角色的目录。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否执行成功（内容已移除）。 |

---

## 示例

### 代码示例 (TypeScript)

#### 1. 删除指定文件

```typescript
await ST_API.file.delete({
  chName: "浅野 响子",
  fileName: "1769164002752_736327955",
  format: "mp3"
});
```

#### 2. 清空当前角色的所有附件

```typescript
await ST_API.file.delete({
  useCharacterDir: true
});
```

## 响应示例

```json
{
  "success": true
}
```
