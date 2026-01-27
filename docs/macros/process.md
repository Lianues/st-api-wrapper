# macros.process

## 描述

对输入文本执行宏替换，并返回处理后的文本。

处理路径：

- 默认：走酒馆 `substituteParams(text, options)`（会遵循酒馆当前的宏引擎设置，例如 `experimental_macro_engine`）。
- `forceNewEngine: true`：强制走新版 `MacroEngine.evaluate`（不受 `experimental_macro_engine` 影响）。

额外说明：

- 当 `options.dynamicMacros` 中包含函数时，为避免旧引擎把函数当作 `(nonce)=>string` 方式调用导致报错，wrapper 会尽量使用新版 `MacroEngine` 来处理（等价于自动启用 `forceNewEngine` 的效果，但只在 MacroEngine 可用时）。\n
## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| text | string | 是 | 要处理的文本 |
| options | object | 否 | 处理选项（见下表） |
| forceNewEngine | boolean | 否 | 是否强制使用新版 MacroEngine（默认 `false`） |

### options 结构（与 substituteParams 对齐）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name1Override | string | 覆盖 `{{user}}` 的名字 |
| name2Override | string | 覆盖 `{{char}}` 的名字 |
| original | string | 覆盖 `{{original}}` 的内容 |
| groupOverride | string | 覆盖 `{{group}}` 的内容 |
| replaceCharacterCard | boolean | 是否替换角色卡相关宏（默认 `true`） |
| dynamicMacros | Record<string, string \| function> | 动态宏（仅本次处理有效） |
| postProcessFn | (x: string) => string | 对每个宏替换结果进行后处理 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功 |
| text | string | 处理后的文本 |
| engine | string | 实际使用的处理路径：`substituteParams` 或 `macroEngine` |
| error | string | 失败时的错误信息 |

---

## 示例

### 基础处理（跟随酒馆当前设置）

```ts
const out = await ST_API.macros.process({
  text: 'Hello {{user}}!',
});
console.log(out.text);
```

### 强制使用 MacroEngine（不受 experimental_macro_engine 影响）

```ts
await ST_API.macros.register({
  name: 'upper',
  options: {
    category: 'custom',
    unnamedArgs: 1,
    handler: ({ unnamedArgs }) => String(unnamedArgs[0] ?? '').toUpperCase(),
  },
});

const out = await ST_API.macros.process({
  text: 'Hello {{upper::world}}',
  forceNewEngine: true,
});
console.log(out.text); // => "Hello WORLD"
```

### 使用 dynamicMacros（仅本次生效）

```ts
const out = await ST_API.macros.process({
  text: 'Hi {{temp}}; 2+3={{add::2::3}}',
  forceNewEngine: true,
  options: {
    dynamicMacros: {
      temp: 'Alice',
      add: ({ unnamedArgs }) => {
        const a = Number(unnamedArgs[0] ?? 0);
        const b = Number(unnamedArgs[1] ?? 0);
        return String(a + b);
      },
    },
    postProcessFn: (x) => x.trim(),
  },
});

console.log(out.text); // => "Hi Alice; 2+3=5"
```

### 响应示例

```json
{
  "ok": true,
  "text": "Hello WORLD",
  "engine": "macroEngine"
}
```

