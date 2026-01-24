# slashCommand.execute

## 描述

执行斜杠指令或 STScript 脚本。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| command | string | 是 | 要执行的指令文本（包含斜杠前缀），例如 `'/echo Hello World'` 或多行脚本 |
| showOutput | boolean | 否 | 是否显示输出到聊天中（默认 `false`） |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 执行是否成功 |
| result | string | 指令返回值（管道结果） |
| error | string | 错误信息（仅在失败时） |

---

## 示例

### 简单执行

```typescript
const result = await ST_API.slashCommand.execute({
  command: '/echo Hello World'
});

console.log(result.ok);     // true
console.log(result.result); // "Hello World"
```

### 显示输出到聊天

```typescript
await ST_API.slashCommand.execute({
  command: '/echo 这条消息会显示在聊天中',
  showOutput: true
});
```

### 执行管道脚本

```typescript
const result = await ST_API.slashCommand.execute({
  command: '/setvar key=count 10 | /getvar count'
});

console.log(result.result); // "10"
```

### 执行复杂脚本

```typescript
const result = await ST_API.slashCommand.execute({
  command: `
    /setvar key=name Alice |
    /setvar key=greeting Hello |
    /echo {{getvar::greeting}}, {{getvar::name}}!
  `
});

console.log(result.result); // "Hello, Alice!"
```

### 条件语句

```typescript
const result = await ST_API.slashCommand.execute({
  command: `
    /setvar key=score 85 |
    /if left={{getvar::score}} rule=gte right=60
      /echo 及格了！
    /else
      /echo 需要努力！
    /endif
  `
});
```

### 响应示例

```json
{
  "ok": true,
  "result": "Hello World"
}
```

### 错误响应示例

```json
{
  "ok": false,
  "error": "Unknown command: /unknowncommand"
}
```
