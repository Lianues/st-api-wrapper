# UI 模块文档

本目录包含 `ui.*` 相关 API 文档。

## 扩展设置面板

- [ui.registerSettingsPanel](./registerSettingsPanel.md)：注册扩展设置面板（inline-drawer）
- [ui.unregisterSettingsPanel](./unregisterSettingsPanel.md)：卸载扩展设置面板
- [ui.listSettingsPanels](./listSettingsPanels.md)：列出已注册的设置面板

## 顶部设置抽屉

- [ui.registerTopSettingsDrawer](./registerTopSettingsDrawer.md)：在顶部工具栏注册抽屉面板
- [ui.unregisterTopSettingsDrawer](./unregisterTopSettingsDrawer.md)：注销顶部抽屉面板

## 菜单项

- [ui.registerExtensionsMenuItem](./registerExtensionsMenuItem.md)：注册扩展菜单项
- [ui.unregisterExtensionsMenuItem](./unregisterExtensionsMenuItem.md)：注销扩展菜单项
- [ui.registerOptionsMenuItem](./registerOptionsMenuItem.md)：注册选项菜单项
- [ui.unregisterOptionsMenuItem](./unregisterOptionsMenuItem.md)：注销选项菜单项

## 聊天操作

- [ui.scrollChat](./scrollChat.md)：滚动聊天记录到指定位置

## 输入栏

- [ui.setSendBusy](./setSendBusy.md)：设置发送按钮等待态（不阻断发送）

## 消息按钮

- [ui.registerMessageButton](./registerMessageButton.md)：注册消息操作按钮（与 Edit 同级）
- [ui.unregisterMessageButton](./unregisterMessageButton.md)：注销消息操作按钮
- [ui.registerExtraMessageButton](./registerExtraMessageButton.md)：注册扩展消息按钮（在 ... 菜单内）
- [ui.unregisterExtraMessageButton](./unregisterExtraMessageButton.md)：注销扩展消息按钮

## 消息标题区域

- [ui.registerMessageHeaderElement](./registerMessageHeaderElement.md)：在消息标题区域注册自定义元素
- [ui.unregisterMessageHeaderElement](./unregisterMessageHeaderElement.md)：注销消息标题区域元素

## 界面刷新

- [ui.reloadChat](./reloadChat.md)：重载当前聊天界面
- [ui.reloadSettings](./reloadSettings.md)：重载设置界面
