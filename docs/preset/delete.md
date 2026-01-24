# preset.delete

## 描述

从服务器中删除指定的采样预设。

## 输入

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 要删除的预设名称。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 是否删除成功。 |

## 示例

### 代码示例 (TypeScript)

```typescript
const res = await ST_API.preset.delete({
  name: "Temporary Preset"
});

if (res.success) {
  console.log('预设已删除');
}
```

## 响应示例

```json
{
  "success": true
}
```
