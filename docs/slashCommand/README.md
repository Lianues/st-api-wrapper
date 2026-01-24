# slashCommand API

斜杠指令（Slash Command）API 提供注册、执行和管理 SillyTavern 斜杠指令的功能。

## 方法列表

| 方法 | 说明 |
| --- | --- |
| [register](./register.md) | 注册新的斜杠指令 |
| [unregister](./unregister.md) | 注销已注册的斜杠指令 |
| [execute](./execute.md) | 执行斜杠指令 |
| [list](./list.md) | 列出所有已注册的斜杠指令 |

## 快速开始

```typescript
// 注册一个简单的斜杠指令
await ST_API.slashCommand.register({
  name: 'hello',
  callback: (ctx) => `Hello, ${ctx.unnamedArgs || 'World'}!`,
  helpString: '打招呼指令',
});

// 执行斜杠指令
const result = await ST_API.slashCommand.execute({
  command: '/hello SillyTavern'
});
console.log(result.result); // "Hello, SillyTavern!"

// 显示输出到聊天中
await ST_API.slashCommand.execute({
  command: '/echo 这条消息会显示在聊天中',
  showOutput: true
});

// 注销指令
await ST_API.slashCommand.unregister({ name: 'hello' });
```
