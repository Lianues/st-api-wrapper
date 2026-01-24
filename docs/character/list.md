# character.list

## 描述

获取**全部**角色卡列表。

- 默认直接返回酒馆后端 `/api/characters/all` 的结果（可能是 `shallow` 角色，取决于酒馆性能设置）。
- 如果传入 `full: true`，则会在拿到列表后，再逐个调用 `character.get()` 拉取完整卡数据。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| full | boolean | 否 | 是否强制返回完整角色卡（默认 `false`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| characters | object[] | 角色对象数组（已整理为 `name / description / avatar / message / worldBook / regexScripts / other / chatDate / createDate`）。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 1) 默认：快速列出（可能是 shallow）
const list1 = await ST_API.character.list();
console.log("角色数量:", list1.characters.length);
console.log("第一个角色 avatar:", list1.characters[0]?.avatar);

// 2) full：强制拉取每个角色的完整卡
const list2 = await ST_API.character.list({ full: true });
console.log("full 角色数量:", list2.characters.length);
console.log("第一个角色 description:", list2.characters[0]?.description);
```

### 响应示例

```json
{
  "characters": [
    {
      "name": "Alice",
      "description": "",
      "avatar": "Alice.png",
      "message": [],
      "worldBook": null,
      "regexScripts": [],
      "other": {
        "shallow": true,
        "tags": [],
        "data": {
          "name": "Alice",
          "creator": "",
          "creator_notes": "",
          "tags": [],
          "extensions": { "fav": false }
        }
      },
      "chatDate": "2025-9-8 @00h 06m 01s 299ms",
      "createDate": "2025-09-08T00:06:01.299Z"
    }
  ]
}
```

