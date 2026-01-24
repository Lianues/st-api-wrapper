import { createApp } from 'vue';
import App from './App.vue';
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
    if (isRegistered || document.getElementById('st-api-wrapper.settings_container')) return;
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
  };

  // 监听准备就绪事件
  eventSource.on(event_types.APP_READY, register);

  // 兜底：如果 APP_READY 已经触发过，或者立即尝试
  register();
}

initSelfPanel();
