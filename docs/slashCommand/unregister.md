# slashCommand.unregister

## 描述

注销一个已注册的斜杠指令。只能注销通过 `ST_API.slashCommand.register` 注册的指令。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 要注销的指令名称 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否注销成功。如果指令不存在或不是通过此 API 注册的，返回 `false` |

---

## 示例

### 代码示例

```typescript
// 先注册一个指令
await ST_API.slashCommand.register({
  name: 'mycommand',
  callback: () => 'Hello!',
});

// 注销指令
const result = await ST_API.slashCommand.unregister({
  name: 'mycommand'
});

console.log(result.ok); // true
```

### 响应示例

```json
{
  "ok": true
}
```
