# character.delete

## 描述

删除指定角色卡。

该接口对应酒馆后端：`/api/characters/delete`（内部参数 `avatar_url`）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| avatarUrl | string | 是 | 角色头像文件名（通常以 `.png` 结尾）。 |
| deleteChats | boolean | 否 | 是否同时删除该角色的聊天记录目录（默认 `false`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
const res = await ST_API.character.delete({
  avatarUrl: "Alice.png",
  deleteChats: false
});

if (res.ok) {
  console.log("角色卡已删除");
}
```

### 响应示例

```json
{
  "ok": true
}
```

