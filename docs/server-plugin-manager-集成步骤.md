# server-plugin-manager + st-api-wrapper 集成步骤（本地）

本文档目标：让你在前端通过 `ST_API.serverPlugin.*` **可视化管理后端 Server Plugins**（安装/删除/列出/获取），并在操作后自动重启酒馆后端。

---

## 1. 安装后端 Server Plugin（server-plugin-manager）

把本仓库里的目录：

- `server-plugins/server-plugin-manager/`

复制到你的 SillyTavern 运行目录下：

- `SillyTavern/plugins/server-plugin-manager/`

最终应该存在文件：

- `SillyTavern/plugins/server-plugin-manager/index.mjs`

---

## 2. 启用 Server Plugins（config.yaml 在哪里？）

在你实际使用的 `config.yaml` 里启用：

- `enableServerPlugins: true`

酒馆启动时会打印类似：

- `Using config path: ./config.yaml`

这通常表示它实际读取的是 **SillyTavern 根目录（和 `server.js` 同级）下的 `config.yaml`**，也就是：

- `SillyTavern/config.yaml`

修改后需要 **重启酒馆** 才会加载插件。

---

## 3. 编译并安装 `st-api-wrapper`（你自己执行）

```bash
cd "F:/111/酒馆插件教程/st-api-wrapper"
npm install
npm run build
```

然后把整个 `st-api-wrapper` 目录安装到你的 SillyTavern（参考你之前的安装方式）。

---

## 4. 使用（两种入口）

### 入口 A：前端设置面板（推荐）

在酒馆的“扩展设置”里会出现一个新的面板：

- **后端插件管理**

你可以在里面：

- 刷新插件列表
- 输入 Git URL 安装插件（可选指定 folderName/branch）
- 上传 zip 安装插件（自动解压）
- 从后端本地路径导入目录/文件
- 删除插件
- 查看插件详情
- 手动触发重启

### 入口 B：浏览器控制台

```js
await ST_API.serverPlugin.list()
await ST_API.serverPlugin.get({ name: 'command-exec' })
await ST_API.serverPlugin.add({ gitUrl: 'https://github.com/xxx/yyy.git', restart: true })
await ST_API.serverPlugin.addZip({ zipBase64: 'data:application/zip;base64,...', fileName: 'my.zip', restart: true })
await ST_API.serverPlugin.addPath({ sourcePath: 'F:\\\\SillyTavern\\\\my-plugins\\\\xxx', restart: true })
await ST_API.serverPlugin.delete({ name: 'yyy', restart: true })
```

---

## 5. 关于“自动重启”

该管理插件提供两种重启方式：

- `respawn`：尽力自拉起新进程，再退出旧进程（默认）
- `exit`：仅退出旧进程（是否自动拉起取决于你的启动方式，如 docker/pm2）

Windows 使用 `Start.bat` 启动时，`exit` 模式通常不会自动拉起；如果你发现没自动重启，请改用 `respawn` 或手动重新启动酒馆。

