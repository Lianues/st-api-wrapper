# preset.get

## 描述

获取**单个**预设的详细配置。
响应结构已针对开发者体验进行了深度优化：
- **字段简化**：重命名了繁琐的注入参数（如 `depth`, `order`, `trigger`, `position`）。
- **合并状态**：将 `prompts` 与顺序列表合并，并自动同步启用状态。
- **自动排序**：数组已按照实际注入位置（`index`）进行排序。
- **单目标明确**：本接口仅获取单个预设；如需列出全部预设详情请使用 `preset.list()`。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | (可选) 预设名称。不传则返回当前活跃预设。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| preset | PresetInfo \| null | 单个预设对象，找不到则为 null。 |

### PresetInfo 结构
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 预设名称。 |
| prompts | PromptInfo[] | 合并后的 Prompt 列表，已按加载顺序排序。 |
| regexScripts | RegexScriptData[] | 预设绑定的正则脚本（从 `apiSetting.extensions.regex_scripts` 提取并做结构简化）。 |
| apiSetting | object | 采样参数（排除了 prompts 逻辑；包含 `extensions` 等字段）。 |

### PromptInfo 结构
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| identifier | string | 唯一 ID。 |
| name | string | Prompt 名称。 |
| enabled | boolean | 是否启用。 |
| index | number? | 在预设顺序列表中的索引。未加载则不存在。 |
| role | string | 消息角色 (system/user 等)。 |
| content | string | 文本内容。 |
| depth | number | 注入深度。 |
| order | number | 注入顺序。 |
| position | string | 注入位置模式: `'relative'` (相对) 或 `'fixed'` (固定)。 |
| trigger | any[] | 注入触发器。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// 1) 获取当前活跃预设
const res = await ST_API.preset.get();
console.log('当前预设名称:', res.preset?.name);

// 2) 获取指定名称预设
const byName = await ST_API.preset.get({ name: 'Default' });
console.log('Default 预设:', byName.preset);

// 3) 获取全部预设详情（另一个接口）
const allRes = await ST_API.preset.list();
console.log('当前激活:', allRes.active);
console.log('所有预设详细内容:', allRes.presets);
```

## 响应示例

```json
{
  "preset": {
    "name": "Default",
    "prompts": [
      {
        "identifier": "main",
        "name": "Main Prompt",
        "enabled": true,
        "index": 0,
        "role": "system",
        "content": "你是一个有用的助手...",
        "depth": 0,
        "order": 100,
        "position": "relative",
        "trigger": []
      }
    ],
    "regexScripts": [],
    "apiSetting": { "temp": 1.0 }
  }
}
```
