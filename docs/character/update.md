# character.update

## 描述

修改指定角色卡（对原角色对象做 deep-merge，并进行 TavernCard v2 校验）。

该接口对应酒馆后端：`/api/characters/merge-attributes`（内部参数 `avatar`）。

> 注意：这是“合并更新”，而不是“全量覆盖”。你只需要提供要修改的字段即可。  
> 如果你要改文件名/重命名角色卡，需要用酒馆的 rename 接口（本 wrapper 目前未封装）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 角色名称。内部会自动拼接为 `name + ".png"` 作为后端 `avatar`；即便你传入的 name 已经包含 `.png`，也会继续追加（会变成 `xxx.png.png`），因此请只传“纯名字”。 |
| patch | object | 是 | 要合并到角色卡的 patch（请不要包含 `json_data`）。 |
| returnCharacter | boolean | 否 | 更新后是否额外调用一次 `character.get()` 返回最新角色卡（默认 `false`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| character | object? | 可选：如果 `returnCharacter=true`，这里会包含更新后的**整理结构**角色卡。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 示例：修改 spec v2 的 data.description
const res = await ST_API.character.update({
  name: "Alice",
  patch: {
    data: {
      description: "这是新的角色描述（通过 merge-attributes 合并写入）"
    }
  },
  returnCharacter: true
});

console.log("ok:", res.ok);
console.log("更新后 description:", res.character?.description);
```

### 响应示例

```json
{
  "ok": true,
  "character": {
    "name": "Alice",
    "description": "这是新的角色描述（通过 merge-attributes 合并写入）",
    "avatar": "Alice.png",
    "message": ["首条消息", "备选问候1"],
    "worldBook": null,
    "regexScripts": [],
    "other": {
      "data": {
        "name": "Alice",
        "description": "这是新的角色描述（通过 merge-attributes 合并写入）"
      }
    },
    "chatDate": "2025-9-8 @00h 06m 01s 299ms",
    "createDate": "2025-09-08T00:06:01.299Z"
  }
}
```

