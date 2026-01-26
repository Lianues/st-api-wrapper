import { createApp } from 'vue';
import App from './App.vue';
import ServerPluginManager from './ServerPluginManager.vue';
import CommandExecSandbox from './CommandExecSandbox.vue';
import { ApiRegistry } from './core/registry';
import { registerAllApis } from './apis';

const VERSION_STR = '1.0.0';

// Core registry: all APIs register here, then exposed as a stable window.ST_API object.
const registry = new ApiRegistry();
registerAllApis(registry);
window.ST_API = registry.getPublicApi(VERSION_STR);

/**
 * 注册插件自身的设置面板
 */
async function initSelfPanel() {
  const ctx = window.SillyTavern?.getContext?.();
  if (!ctx) return;

  const { eventSource, event_types } = ctx;

  let isRegistered = false;

  const register = async () => {
    // 避免重复注册
    if (isRegistered || document.getElementById('st-api-wrapper_settings_container')) return;
    isRegistered = true;

    // 定义独立的注册函数，互不影响
    const safeRegister = async (label: string, fn: () => Promise<any>) => {
      try {
        await fn();
      } catch (e) {
        console.warn(`[ST API] ${label} registration skipped:`, e instanceof Error ? e.message : e);
      }
    };

    // 1. 注册设置面板
    await safeRegister('Settings Panel', () => window.ST_API.ui.registerSettingsPanel({
      id: 'st-api-wrapper.settings',
      title: 'ST API Wrapper',
      target: 'extensions_settings',
      expanded: false,
      order: 0,
      content: {
        kind: 'render',
        render: (container: HTMLElement) => {
          const mountPoint = document.createElement('div');
          container.appendChild(mountPoint);
          const app = createApp(App);
          app.mount(mountPoint);
          return () => app.unmount();
        },
      },
    }));

    const probeBackend = async (url: string) => {
      try {
        const liveCtx = window.SillyTavern?.getContext?.();
        const headers: Record<string, string> = {
          ...(liveCtx?.getRequestHeaders ? liveCtx.getRequestHeaders() : {}),
          'Content-Type': 'application/json',
        };
        const resp = await fetch(url, {
          method: 'POST',
          headers,
          body: '{}',
        });
        return resp.ok;
      } catch {
        return false;
      }
    };

    // 2. 根据后端可用性决定是否注册“后端插件管理”面板
    const isServerPluginManagerAvailable = await probeBackend('/api/plugins/server-plugin-manager/probe');
    if (!isServerPluginManagerAvailable) {
      console.warn('[ST API] Server Plugin Manager backend not available. Panel registration skipped.');
    } else {
      await safeRegister('Server Plugin Manager Panel', () => window.ST_API.ui.registerSettingsPanel({
        id: 'st-api-wrapper.server_plugin_manager',
        title: '后端插件管理',
        target: 'extensions_settings',
        expanded: false,
        order: 1,
        content: {
          kind: 'render',
          render: (container: HTMLElement) => {
            const mountPoint = document.createElement('div');
            container.appendChild(mountPoint);
            const app = createApp(ServerPluginManager);
            app.mount(mountPoint);
            return () => app.unmount();
          },
        },
      }));
    }

    // 3. 根据后端可用性决定是否注册“后端命令权限配置”面板
    // 用 /sandbox/get 探测，以避免后端版本过旧导致面板无法工作
    const isCommandExecAvailable = await probeBackend('/api/plugins/command-exec/sandbox/get');
    if (!isCommandExecAvailable) {
      console.warn('[ST API] Command Exec backend not available. Sandbox panel registration skipped.');
    } else {
      await safeRegister('Command Exec Sandbox Panel', () => window.ST_API.ui.registerSettingsPanel({
        id: 'st-api-wrapper.command_exec_sandbox',
        title: '后端命令权限配置',
        target: 'extensions_settings',
        expanded: false,
        order: 2,
        content: {
          kind: 'render',
          render: (container: HTMLElement) => {
            const mountPoint = document.createElement('div');
            container.appendChild(mountPoint);
            const app = createApp(CommandExecSandbox);
            app.mount(mountPoint);
            return () => app.unmount();
          },
        },
      }));
    }
  };

  // 监听准备就绪事件
  eventSource.on(event_types.APP_READY, register);

  // 兜底：如果 APP_READY 已经触发过，或者立即尝试
  register();
}

initSelfPanel();
