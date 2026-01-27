# macros.list

## 描述

列出酒馆新版宏系统（`MacroRegistry`）中已注册的宏定义（**不包含 handler 函数本体**），用于做调试/文档/自动补全等用途。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| excludeAliases | boolean | 否 | 是否排除 alias 条目（仅返回主宏），默认 `false` |
| excludeHiddenAliases | boolean | 否 | 是否排除 `visible=false` 的 alias 条目，默认 `false` |
| onlyRegisteredByWrapper | boolean | 否 | 是否仅返回通过 `ST_API.macros.register` 注册的宏（含 aliases），默认 `false` |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| macros | array | 宏定义列表（可序列化） |

### macros[] 常用字段

- `name`: 宏名（若为 alias，则这里是 alias 名）
- `category`: 分类
- `minArgs` / `maxArgs`: 未命名参数数量范围
- `list`: `{ min, max } \| null`（list 参数定义）
- `description` / `returns`
- `exampleUsage`: 示例列表
- `aliasOf`: 若为 alias，则指向主宏名
- `registeredByWrapper`: 是否由本 wrapper 注册

---

## 示例

### 列出全部宏（含内置）

```ts
const { macros } = await ST_API.macros.list({
  excludeHiddenAliases: true,
});
console.log(macros.length, macros[0]);
```

### 仅列出本 wrapper 注册的宏

```ts
const { macros } = await ST_API.macros.list({
  onlyRegisteredByWrapper: true,
});
console.log(macros.map((m) => m.name));
```

### 响应示例（截断）

```json
{
  "macros": [
    {
      "name": "upper",
      "aliases": [{"alias": "up", "visible": true}],
      "category": "custom",
      "minArgs": 1,
      "maxArgs": 1,
      "unnamedArgDefs": [{"name": "text", "optional": false, "type": "string"}],
      "list": null,
      "strictArgs": true,
      "description": "将输入转为大写",
      "returns": null,
      "returnType": "string",
      "displayOverride": null,
      "exampleUsage": ["{{upper::hello}}"],
      "aliasOf": null,
      "aliasVisible": null,
      "registeredByWrapper": true
    }
  ]
}
```

