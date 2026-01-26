# server-plugin-manager (SillyTavern Server Plugin)

这是一个 **酒馆后端 Server Plugin**，用于在前端管理 **Server Plugins**（安装/删除/列出/获取），并在操作后触发重启。

## 安装位置

将整个 `server-plugin-manager` 文件夹复制到你的酒馆运行目录下的：

- `SillyTavern/plugins/server-plugin-manager/`

最终应当存在文件：

- `SillyTavern/plugins/server-plugin-manager/index.mjs`

## 启用

在你实际使用的 `config.yaml` 中设置：

- `enableServerPlugins: true`

然后重启酒馆。

> 你可以从酒馆启动日志确认它实际读取的配置文件位置，例如看到：  
> `Using config path: ./config.yaml`  
> 这通常表示配置文件就在 **SillyTavern 根目录（和 `server.js` 同级）下的 `config.yaml`**。

## API 路径

统一前缀：

- `/api/plugins/server-plugin-manager/*`

提供：

- `POST /probe`
- `POST /list`
- `POST /get`
- `POST /add`（目前实现为 git clone 安装）
- `POST /addZip`（上传 zip base64 并解压安装）
- `POST /addPath`（从后端本地路径导入目录/文件）
- `POST /delete`
- `POST /restart`

## 重启说明（重要）

该插件会在 `add/delete/restart` 后尝试重启：

- `restartMode=respawn`：尽力“自拉起”一个新进程，再发 SIGTERM 退出旧进程  
- `restartMode=exit`：只退出旧进程（是否自动拉起取决于你怎么启动酒馆，例如 docker/pm2 才会自动拉起）

在 Windows 的 `Start.bat` 启动方式下，**进程退出不一定会自动重启**。如果你发现退出后没有自动拉起，请手动重新启动酒馆。

### Windows 终端显示（与原逻辑一致）

在 Windows 上，如果检测到 `SillyTavern/Start.bat` 存在，`respawn` 会在**新控制台窗口**中启动 `Start.bat`，这样你能像平时双击启动一样看到完整日志与 `pause` 提示。

