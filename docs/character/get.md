# character.get

## 描述

获取**单个**角色卡的完整数据（full character card）。

该接口对应酒馆后端：`/api/characters/get`（内部参数 `avatar_url`）。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 角色名称。内部会自动拼接为 `name + ".png"` 作为后端 `avatar_url`；即便你传入的 name 已经包含 `.png`，也会继续追加（会变成 `xxx.png.png`），因此请只传“纯名字”。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| character | object | 经过整理的角色卡对象：`name / description / avatar / message / worldBook / regexScripts / other / chatDate / createDate`。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 先随便写一个示例角色名（实际请从 character.list() 里拿）
const res = await ST_API.character.get({
  name: "Alice",
});

console.log("角色名:", res.character?.name);
console.log("角色描述:", res.character?.description);
console.log("头像文件:", res.character?.avatar);
console.log("合并消息 message[0]:", res.character?.message?.[0]);
console.log("绑定世界书名:", res.character?.worldBook?.name);
console.log("角色正则脚本数量:", res.character?.regexScripts?.length);
console.log("聊天标识 chatDate:", res.character?.chatDate);
console.log("创建时间 createDate:", res.character?.createDate);
```

### 响应示例

```json
{
  "character": {
    "name": "Alice",
    "description": "......",
    "avatar": "Alice.png",
    "message": ["首条消息", "备选问候1", "备选问候2"],
    "worldBook": {
      "name": "Alice",
      "entries": []
    },
    "regexScripts": [
      {
        "id": "bea00e49-03d4-4885-889e-34c3eaddbe2b",
        "name": "Remove XML Tags",
        "enabled": true,
        "findRegex": "<([a-zA-Z0-9]+)>(.|\\n)*?</\\1>",
        "replaceRegex": "",
        "trimRegex": [],
        "targets": ["aiOutput"],
        "view": ["user"],
        "runOnEdit": true,
        "macroMode": "none",
        "minDepth": null,
        "maxDepth": null
      }
    ],
    "other": {
      "spec": "chara_card_v3",
      "spec_version": "3.0",
      "data": {
        "name": "Alice",
        "description": "......",
        "extensions": {
          "fav": false
        }
      },
      "json_data": "{...}"
    },
    "chatDate": "2025-9-8 @00h 06m 01s 299ms",
    "createDate": "2025-09-08T00:06:01.299Z"
  }
}
```

---

## other 字段记录（示例）

```json
{
  "name": "大少女乐队时代",
  "description": "",
  "personality": "",
  "scenario": "",
  "mes_example": "",
  "creatorcomment": "",
  "avatar": "大少女乐队时代.png",
  "talkativeness": "0.5",
  "fav": false,
  "tags": [],
  "spec": "chara_card_v3",
  "spec_version": "3.0",
  "data": {
    "name": "大少女乐队时代",
    "description": "",
    "personality": "",
    "scenario": "",
    "mes_example": "",
    "creator_notes": "",
    "system_prompt": "",
    "post_history_instructions": "",
    "tags": [],
    "creator": "",
    "character_version": "",
    "extensions": {
      "talkativeness": "0.5",
      "fav": false,
      "world": "大少女乐队无兽耳时代",
      "depth_prompt": {
        "prompt": "",
        "depth": 4,
        "role": "system"
      }
    },
    "group_only_greetings": []
  },
  "json_data": "xxx",
  "date_added": 1769250972654.5657,
  "chat_size": 49651,
  "date_last_chat": 1769327158319.1345,
  "data_size": 13959
}
```

