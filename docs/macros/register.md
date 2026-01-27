# macros.register

## 描述

注册一个**自定义宏**到酒馆新版宏系统（`MacroRegistry`）。注册后即可在支持宏替换的地方使用（例如提示词模板、STscript、角色卡字段等）。

注意：

- 宏 `handler` **必须是同步函数**；如果返回 `Promise`，将被忽略并返回空字符串。
- 为了让“带 `::` 参数”的自定义宏参与酒馆默认替换流程，`macros.register` 默认会自动开启 `experimental_macro_engine`（可通过 `ensureExperimentalMacroEngine: false` 关闭）。  
  如果你不希望改动全局设置，也可以只用 `macros.process({ forceNewEngine: true })` 来手动处理文本并拿到结果。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 宏名称（不需要 `{{}}`），例如 `'upper'` |
| options | object | 是 | 宏定义（见下表） |
| allowOverwrite | boolean | 否 | 是否允许覆盖同名宏（包含内置宏/其他插件宏），默认 `false` |
| registerLegacy | boolean | 否 | 是否同步注册到旧版宏系统（用于 `experimental_macro_engine` 关闭时的“页面即时替换/预览”）。仅支持 `{{name}}` 0 参数形式，默认 `false` |
| ensureExperimentalMacroEngine | boolean | 否 | 是否在注册时自动开启 `experimental_macro_engine`（并触发保存），让带 `::` 参数的自定义宏也能参与酒馆默认替换流程，默认 `true`（传 `false` 可关闭） |

## 关键参数说明（建议先看这里）

### ensureExperimentalMacroEngine（默认 true）

**作用**：让你注册的“带 `::` 参数”的自定义宏，能进入酒馆默认的 `substituteParams(...)` 替换流程。

**为什么你会看到 `{{setvar::a::1}}` 输入后立刻消失？**  
因为 `setvar` 属于酒馆内置的变量宏：旧引擎就能识别并执行副作用，且返回空字符串，所以宏块会消失。

**你的自定义参数宏如果只注册在新版 MacroRegistry 里**，在 `experimental_macro_engine` 关闭时，酒馆默认替换仍走旧引擎，所以不会触发。
开启 `experimental_macro_engine` 后，酒馆的 `substituteParams(...)` 会切到新版 `MacroEngine`，你的自定义宏（含参数）就能像 `setvar` 一样在默认流程里被替换/消失。

**副作用**：它会修改酒馆的 `power_user.experimental_macro_engine` 并调用 `saveSettingsDebounced()` 尝试保存。

如果你不希望改动全局设置，请显式传 `ensureExperimentalMacroEngine: false`，并用 `macros.process({ forceNewEngine: true })` 来手动处理文本。
### registerLegacy（默认 false）

**作用**：在 `experimental_macro_engine` 关闭时，把宏同步注册到旧宏系统，用于一些依赖旧宏系统的“即时预览/替换”场景。

**限制**：旧宏系统只支持 0 参数宏（`{{name}}`），不支持 `{{name::...}}`。

**与 ensureExperimentalMacroEngine 的关系**：如果 `ensureExperimentalMacroEngine` 开启并成功启用了新引擎，wrapper 会自动跳过 legacy 注册（避免 legacy 把宏覆盖成只支持 `{{name}}` 的形式）。
### allowOverwrite（默认 false）

**作用**：允许覆盖已存在的同名宏（包含内置宏/其他插件宏）。默认禁止，避免误伤。

### options 结构

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| handler | function | 是 | 宏处理函数（同步）。签名：`(ctx) => any` |
| category | string | 否 | 分类（用于文档/自动补全分组），默认 `'custom'` |
| description | string | 否 | 宏描述 |
| returns | string | 否 | 返回值描述 |
| returnType | string \| string[] | 否 | 返回值类型：`'string' \| 'integer' \| 'number' \| 'boolean'` |
| unnamedArgs | number \| array | 否 | 未命名参数：传 `number` 表示全部必填；传数组可定义 `optional/default/type` 等 |
| list | boolean \| object | 否 | 是否允许 list 参数（位于 unnamedArgs 后）；或 `{ min, max }` 限制长度 |
| strictArgs | boolean | 否 | 是否严格校验参数数量，默认 `true` |
| aliases | array | 否 | 别名定义：`{ alias: string; visible?: boolean }[]` |
| displayOverride | string | 否 | 覆盖展示签名（需包含 `{{}}`） |
| exampleUsage | string \| string[] | 否 | 示例用法（需包含 `{{}}`） |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功 |
| name | string | 注册的主宏名 |
| registeredNames | string[] | 实际注册的名字集合（包含 aliases） |
| engines | string[] | 实际注册到的引擎列表：`macroEngine` / `legacy` |
| error | string | 失败时的错误信息 |

---

## 示例

### 注册一个带参数的宏（upper）

```ts
await ST_API.macros.register({
  name: 'upper',
  options: {
    category: 'custom',
    description: '将输入转为大写',
    unnamedArgs: [
      { name: 'text', type: 'string', description: '要转大写的文本' },
    ],
    exampleUsage: '{{upper::hello}}',
    handler: ({ unnamedArgs }) => {
      const [text = ''] = unnamedArgs;
      return String(text).toUpperCase();
    },
  },
});

// 立即处理一段文本并拿结果（不受 experimental_macro_engine 影响）
const out = await ST_API.macros.process({
  text: 'Hello {{upper::world}}',
  forceNewEngine: true,
});
console.log(out.text); // => "Hello WORLD"
```

### 响应示例

```json
{
  "ok": true,
  "name": "upper",
  "registeredNames": ["upper"],
  "engines": ["macroEngine"]
}
```

### 注册一个“页面即时替换”用的 0 参数宏（需要 registerLegacy）

> 当你发现“输入后页面会直接替换显示”的位置没有识别你的自定义宏，通常是因为酒馆当前仍在使用旧宏系统。
```ts
await ST_API.macros.register({
  name: 'siteName',
  registerLegacy: true,
  ensureExperimentalMacroEngine: false,
  options: {
    category: 'custom',
    description: '站点名（演示 0 参数宏）',
    // 注意：旧版宏只支持 {{siteName}}，不能写 {{siteName::xxx}}
    handler: () => 'MySite',
  },
});
```

