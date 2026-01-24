# slashCommand.list

## 描述

列出所有已注册的斜杠指令。

## 输入

无参数。

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| commands | array | 指令列表 |

### commands 数组元素结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 指令名称 |
| aliases | string[] | 指令别名列表 |
| helpString | string | 帮助文本 |

---

## 示例

### 代码示例

```typescript
const result = await ST_API.slashCommand.list();

// 打印所有指令
result.commands.forEach(cmd => {
  console.log(`/${cmd.name} - ${cmd.helpString || '(无描述)'}`);
  if (cmd.aliases.length > 0) {
    console.log(`  别名: ${cmd.aliases.join(', ')}`);
  }
});
```

### 查找特定指令

```typescript
const { commands } = await ST_API.slashCommand.list();

const echoCmd = commands.find(c => c.name === 'echo');
if (echoCmd) {
  console.log('找到 echo 指令:', echoCmd.helpString);
}
```

### 响应示例

```json
{
  "commands": [
    {
      "name": "echo",
      "aliases": [],
      "helpString": "Echoes the text to the chat."
    },
    {
      "name": "setvar",
      "aliases": ["setglobalvar"],
      "helpString": "Sets a variable value."
    },
    {
      "name": "hello",
      "aliases": ["hi", "hey"],
      "helpString": "打招呼指令"
    }
  ]
}
```
