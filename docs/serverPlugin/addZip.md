# serverPlugin.addZip

## 描述

上传一个 zip（Base64）并解压安装到酒馆后端的 `plugins/` 目录中，并可在安装后自动重启酒馆后端以生效。

> 该 API 依赖后端存在 `/api/plugins/server-plugin-manager/addZip`。  
> zip 解压会自动做一次“顶层目录剥离”：如果 zip 内所有文件都在同一个顶层文件夹下且没有根目录文件，会自动去掉该前缀，避免出现 `plugins/<folder>/<folder>/...` 的双层嵌套。

## 输入

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| zipBase64 | string | 是 | zip 文件 Base64（允许 `data:...;base64,` 的 DataURL 形式）。 |
| fileName | string | 否 | 原始文件名（可选；用于推断 folderName）。 |
| folderName | string | 否 | 安装到 `plugins/<folderName>`（不填则从 fileName 推断）。 |
| restart | boolean | 否 | 安装成功后是否自动重启（默认 `true`）。 |
| restartMode | string | 否 | `respawn`（尽力自拉起新进程）或 `exit`（仅退出旧进程），默认 `respawn`。 |
| restartDelayMs | number | 否 | 重启延迟（毫秒，默认 `800`）。 |

## 输出

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功。 |
| folderName | string | 实际安装目录名。 |
| path | string | 实际安装绝对路径。 |
| extractedCount | number | 解压出的文件数量（不含目录）。 |
| stripPrefix | string | 自动剥离的顶层目录前缀（例如 `myplugin/`），如果为空表示未剥离。 |
| restart | object \| null | 是否已调度重启。 |

---

## 示例

### 代码示例 (TypeScript)

```typescript
// file 为 <input type="file"> 选择的 zip
const file = (document.querySelector('input[type=file]') as HTMLInputElement).files![0];
const zipBase64 = await new Promise<string>((resolve, reject) => {
  const r = new FileReader();
  r.onerror = () => reject(r.error);
  r.onload = () => resolve(String(r.result));
  r.readAsDataURL(file);
});

const out = await ST_API.serverPlugin.addZip({
  zipBase64,
  fileName: file.name,
  restart: true,
  restartMode: 'respawn',
});
console.log(out);
```

