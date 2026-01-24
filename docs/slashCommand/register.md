# slashCommand.register

## 描述

注册一个新的斜杠指令。支持定义命名参数、未命名参数、别名等。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 指令名称（不包含斜杠前缀），例如 `'hello'` 将注册为 `/hello` |
| callback | function | 是 | 指令回调函数，接收 `SlashCommandContext` 参数 |
| aliases | string[] | 否 | 指令别名列表 |
| helpString | string | 否 | 帮助文本，显示在指令帮助中 |
| interruptsGeneration | boolean | 否 | 是否中断 AI 生成（默认 `false`） |
| purgeFromMessage | boolean | 否 | 是否从消息中清除指令（默认 `true`） |
| unnamedArgumentList | array | 否 | 未命名参数定义列表 |
| namedArgumentList | array | 否 | 命名参数定义列表 |
| returns | string | 否 | 指令返回类型描述 |
| hidden | boolean | 否 | 是否隐藏（不显示在帮助列表中，默认 `false`） |

### SlashCommandContext 结构

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| namedArgs | Record<string, unknown> | 命名参数对象 |
| unnamedArgs | string | 未命名参数字符串 |
| value | unknown | 管道值 |

### 参数定义结构

**命名参数 (namedArgumentList)**:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 参数名称 |
| description | string | 参数描述 |
| typeList | string[] | 类型列表：`'string'`, `'number'`, `'boolean'`, `'enum'` 等 |
| isRequired | boolean | 是否必需 |
| defaultValue | string | 默认值 |
| enumList | string[] | 枚举值列表（当类型为 enum 时） |

**未命名参数 (unnamedArgumentList)**:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| description | string | 参数描述 |
| typeList | string[] | 类型列表 |
| isRequired | boolean | 是否必需 |
| acceptsMultiple | boolean | 是否接受多个值 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 注册的指令名称 |
| ok | boolean | 是否注册成功 |

---

## 示例

### 简单指令

```typescript
await ST_API.slashCommand.register({
  name: 'hello',
  callback: (ctx) => {
    return `Hello, ${ctx.unnamedArgs || 'World'}!`;
  },
  helpString: '打招呼指令',
});

// 使用: /hello SillyTavern
// 输出: Hello, SillyTavern!
```

### 带命名参数的指令

```typescript
await ST_API.slashCommand.register({
  name: 'greet',
  callback: async (ctx) => {
    const name = ctx.namedArgs.name || ctx.unnamedArgs || 'Guest';
    const times = Number(ctx.namedArgs.times) || 1;
    return `${'Hello, '.repeat(times)}${name}!`;
  },
  aliases: ['hi', 'hey'],
  helpString: '高级打招呼指令，支持重复次数',
  namedArgumentList: [
    {
      name: 'name',
      description: '要打招呼的名字',
      typeList: ['string'],
      isRequired: false,
    },
    {
      name: 'times',
      description: '重复次数',
      typeList: ['number'],
      defaultValue: '1',
    },
  ],
  returns: '打招呼消息',
});

// 使用: /greet name=Alice times=3
// 输出: Hello, Hello, Hello, Alice!
```

### 响应示例

```json
{
  "name": "hello",
  "ok": true
}
```
