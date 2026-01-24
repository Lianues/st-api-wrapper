import type {
  ListSettingsPanelsOutput,
  RegisterSettingsPanelInput,
  RegisterSettingsPanelOutput,
  RegisterExtensionsMenuItemInput,
  RegisterExtensionsMenuItemOutput,
  RegisterOptionsMenuItemInput,
  RegisterOptionsMenuItemOutput,
  SettingsPanelTarget,
  UnregisterSettingsPanelInput,
  UnregisterSettingsPanelOutput,
  ReloadChatOutput,
  ReloadSettingsOutput,
  RegisterTopSettingsDrawerInput,
  RegisterTopSettingsDrawerOutput,
  UnregisterTopSettingsDrawerInput,
  UnregisterTopSettingsDrawerOutput,
} from './types';

const panels = new Map<string, { cleanup?: () => void }>();

function resolveTargetSelector(target?: SettingsPanelTarget): string {
  if (target === 'left' || target === 'extensions_settings') return '#extensions_settings';
  if (target === 'right' || target === 'extensions_settings2') return '#extensions_settings2';
  return target || '#extensions_settings2';
}

/**
 * 等待或检查 APP_READY
 */
async function waitAppReady(): Promise<void> {
  const ctx = (window as any).SillyTavern?.getContext?.();
  if (!ctx) return;

  const { eventSource, event_types } = ctx;

  if (document.getElementById('extensions_settings') || document.getElementById('extensions_settings2')) {
    return;
  }

  return new Promise((resolve) => {
    const done = () => {
      eventSource.removeListener(event_types.APP_READY, done);
      resolve();
    };
    eventSource.on(event_types.APP_READY, done);
    setTimeout(done, 5000);
  });
}

function sanitizeForId(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function applyInitialState(header: HTMLElement, content: HTMLElement, expanded: boolean) {
  const icon = header.querySelector('.inline-drawer-icon');
  if (expanded) {
    content.style.display = 'block';
    icon?.classList.replace('down', 'up');
    icon?.classList.replace('fa-circle-chevron-down', 'fa-circle-chevron-up');
  } else {
    content.style.display = 'none';
    icon?.classList.replace('up', 'down');
    icon?.classList.replace('fa-circle-chevron-up', 'fa-circle-chevron-down');
  }
}

export async function registerSettingsPanel(input: RegisterSettingsPanelInput): Promise<RegisterSettingsPanelOutput> {
  await waitAppReady();

  const targetSelector = resolveTargetSelector(input.target);
  const targetEl = document.querySelector(targetSelector) as HTMLElement;
  if (!targetEl) throw new Error(`Target not found: ${targetSelector}`);

  const containerId = `${sanitizeForId(input.id)}_container`;
  if (document.getElementById(containerId)) {
    throw new Error(`Panel ID already registered: ${input.id}`);
  }

  const wrapper = document.createElement('div');
  wrapper.id = containerId;
  wrapper.className = `extension_container st-api-panel-wrapper ${input.className ?? ''}`.trim();
  wrapper.dataset.order = String(input.order ?? 0);

  const drawer = document.createElement('div');
  drawer.className = 'inline-drawer st-api-drawer';

  const header = document.createElement('div');
  header.className = 'inline-drawer-toggle inline-drawer-header';
  header.innerHTML = `<b>${input.title}</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>`;

  const content = document.createElement('div');
  content.className = 'inline-drawer-content';

  drawer.appendChild(header);
  drawer.appendChild(content);
  wrapper.appendChild(drawer);

  if (typeof input.index === 'number' && input.index >= 0 && input.index < targetEl.children.length) {
    targetEl.insertBefore(wrapper, targetEl.children[input.index]);
  } else {
    targetEl.appendChild(wrapper);
  }

  if (input.content.kind === 'html') {
    content.innerHTML = input.content.html;
  } else if (input.content.kind === 'htmlTemplate') {
    const frag = document.createRange().createContextualFragment(input.content.html);
    const extracted = frag.querySelector(input.content.extractSelector || '.inline-drawer-content');
    content.innerHTML = extracted ? extracted.innerHTML : input.content.html;
  } else if (input.content.kind === 'element') {
    content.appendChild(input.content.element);
  } else if (input.content.kind === 'render') {
    const cleanup = await input.content.render(content);
    panels.set(input.id, { cleanup: typeof cleanup === 'function' ? cleanup : undefined });
  }

  applyInitialState(header, content, !!input.expanded);
  return { id: input.id, containerId, drawer, content };
}

export async function unregisterSettingsPanel(input: UnregisterSettingsPanelInput): Promise<UnregisterSettingsPanelOutput> {
  const containerId = `${sanitizeForId(input.id)}_container`;
  const el = document.getElementById(containerId);
  if (el) {
    el.remove();
  }
  const rec = panels.get(input.id);
  if (rec?.cleanup) rec.cleanup();
  panels.delete(input.id);
  return { ok: true };
}

export async function listSettingsPanels(): Promise<ListSettingsPanelsOutput> {
  return { panels: [] };
}

export async function registerExtensionsMenuItem(input: RegisterExtensionsMenuItemInput): Promise<RegisterExtensionsMenuItemOutput> {
  await waitAppReady();

  const menu = document.getElementById('extensionsMenu');
  if (!menu) throw new Error('Extensions menu (#extensionsMenu) not found');

  const containerId = `${sanitizeForId(input.id)}_ext_container`;
  if (document.getElementById(containerId)) {
    throw new Error(`Extensions menu item ID already registered: ${input.id}`);
  }

  const container = document.createElement('div');
  container.id = containerId;
  container.className = 'extension_container interactable';
  container.tabIndex = 0;

  const item = document.createElement('div');
  item.id = sanitizeForId(input.id);
  item.className = 'list-group-item flex-container flexGap5 interactable';
  item.tabIndex = 0;
  item.setAttribute('role', 'listitem');

  const icon = document.createElement('div');
  icon.className = `extensionsMenuExtensionButton ${input.icon}`;

  item.appendChild(icon);
  const textSpan = document.createElement('span');
  textSpan.textContent = input.label;
  item.appendChild(textSpan);

  item.addEventListener('click', (e) => {
    e.preventDefault();
    input.onClick();
  });

  container.appendChild(item);

  if (typeof input.index === 'number' && input.index >= 0 && input.index < menu.children.length) {
    menu.insertBefore(container, menu.children[input.index]);
  } else {
    menu.appendChild(container);
  }

  return { itemId: item.id };
}

export async function registerOptionsMenuItem(input: RegisterOptionsMenuItemInput): Promise<RegisterOptionsMenuItemOutput> {
  await waitAppReady();

  let menu = document.querySelector('#options_button + .options-content') as HTMLElement | null;
  if (!menu) {
    menu = document.querySelector('.options-content[role="list"]') as HTMLElement | null;
  }
  if (!menu) {
    menu = document.querySelector('.options-content') as HTMLElement | null;
  }

  if (!menu) throw new Error('Options menu (.options-content) not found');

  const itemId = sanitizeForId(input.id);
  if (document.getElementById(itemId)) {
    throw new Error(`Options menu item ID already registered: ${input.id}`);
  }

  const item = document.createElement('a');
  item.id = itemId;
  item.className = 'interactable';
  item.tabIndex = 0;

  const icon = document.createElement('i');
  icon.className = `fa-lg ${input.icon}`;

  const textSpan = document.createElement('span');
  textSpan.textContent = input.label;

  item.appendChild(icon);
  item.appendChild(document.createTextNode(' '));
  item.appendChild(textSpan);

  item.addEventListener('click', (e) => {
    e.preventDefault();
    input.onClick();
  });

  if (typeof input.index === 'number' && input.index >= 0 && input.index < menu.children.length) {
    menu.insertBefore(item, menu.children[input.index]);
  } else {
    menu.appendChild(item);
  }

  return { itemId: item.id };
}

/**
 * 重载当前聊天界面
 */
export async function reloadChat(): Promise<ReloadChatOutput> {
  const ctx = (window as any).SillyTavern?.getContext?.();
  if (ctx?.reloadCurrentChat) {
    await ctx.reloadCurrentChat();
    return { ok: true };
  }
  return { ok: false };
}

/**
 * 重载设置界面 (保存并尝试刷新 UI)
 */
export async function reloadSettings(): Promise<ReloadSettingsOutput> {
  const ctx = (window as any).SillyTavern?.getContext?.();
  if (!ctx) return { ok: false };

  // 1. 触发保存 (这通常也会触发一些轻量级的 UI 同步)
  if (ctx.saveSettingsDebounced) {
    ctx.saveSettingsDebounced();
  }

  // 2. 触发一些核心事件，强制 extension 重新检查状态
  if (ctx.eventSource && ctx.eventTypes) {
    const { eventSource, eventTypes } = ctx;
    // 触发预设变更事件，这能让 Regex 等扩展重载
    eventSource.emit(eventTypes.PRESET_CHANGED);
    // 触发设置加载完成事件，模拟从后端重新同步了设置
    eventSource.emit(eventTypes.SETTINGS_LOADED);
  }

  return { ok: true };
}

// ============================================================================
// Top Settings Drawer (顶部设置抽屉)
// ============================================================================

const topDrawers = new Map<string, { cleanup?: () => void }>();

/**
 * 注册顶部设置抽屉
 *
 * 在 #top-settings-holder 中创建一个类似 #sys-settings-button 的 drawer 结构：
 * ```html
 * <div id="{id}" class="drawer">
 *   <div class="drawer-toggle drawer-header">
 *     <div class="drawer-icon {icon} closedIcon interactable" title="{title}"></div>
 *   </div>
 *   <div class="drawer-content closedDrawer">
 *     <!-- 用户自定义内容 -->
 *   </div>
 * </div>
 * ```
 */
export async function registerTopSettingsDrawer(
  input: RegisterTopSettingsDrawerInput
): Promise<RegisterTopSettingsDrawerOutput> {
  await waitAppReady();

  const topHolder = document.getElementById('top-settings-holder');
  if (!topHolder) {
    throw new Error('Target not found: #top-settings-holder');
  }

  const drawerId = sanitizeForId(input.id);
  if (document.getElementById(drawerId)) {
    throw new Error(`Top settings drawer ID already registered: ${input.id}`);
  }

  // 创建 drawer 根元素
  const drawer = document.createElement('div');
  drawer.id = drawerId;
  drawer.className = `drawer st-api-top-drawer ${input.className ?? ''}`.trim();

  // 创建 drawer-toggle (header)
  const toggle = document.createElement('div');
  toggle.className = 'drawer-toggle drawer-header';

  // 创建图标按钮
  const iconBtn = document.createElement('div');
  iconBtn.className = `drawer-icon ${input.icon} closedIcon interactable`;
  if (input.title) {
    iconBtn.title = input.title;
  }
  iconBtn.tabIndex = 0;
  iconBtn.setAttribute('role', 'button');

  toggle.appendChild(iconBtn);

  // 创建 drawer-content
  const content = document.createElement('div');
  content.className = 'drawer-content closedDrawer';

  drawer.appendChild(toggle);
  drawer.appendChild(content);

  // 插入到 top-settings-holder
  if (typeof input.index === 'number' && input.index >= 0 && input.index < topHolder.children.length) {
    topHolder.insertBefore(drawer, topHolder.children[input.index]);
  } else {
    topHolder.appendChild(drawer);
  }

  // 渲染内容
  let cleanupFn: (() => void) | undefined;

  if (input.content.kind === 'html') {
    content.innerHTML = input.content.html;
  } else if (input.content.kind === 'element') {
    content.appendChild(input.content.element);
  } else if (input.content.kind === 'render') {
    const result = await input.content.render(content);
    if (typeof result === 'function') {
      cleanupFn = result;
    }
  }

  topDrawers.set(input.id, { cleanup: cleanupFn });

  // 状态管理
  let isOpen = !!input.expanded;

  const updateVisualState = () => {
    if (isOpen) {
      content.classList.remove('closedDrawer');
      iconBtn.classList.remove('closedIcon');
    } else {
      content.classList.add('closedDrawer');
      iconBtn.classList.add('closedIcon');
    }
  };

  const openDrawer = async () => {
    if (isOpen) return;
    isOpen = true;
    updateVisualState();
    if (input.onOpen) {
      await input.onOpen();
    }
  };

  const closeDrawer = async () => {
    if (!isOpen) return;
    isOpen = false;
    updateVisualState();
    if (input.onClose) {
      await input.onClose();
    }
  };

  const toggleDrawer = () => {
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  // 初始状态
  updateVisualState();

  // 绑定点击事件
  toggle.addEventListener('click', toggleDrawer);

  // 支持键盘操作
  iconBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDrawer();
    }
  });

  return {
    id: input.id,
    drawerId,
    drawer,
    content,
    toggle: toggleDrawer,
    open: openDrawer,
    close: closeDrawer,
  };
}

/**
 * 注销顶部设置抽屉
 */
export async function unregisterTopSettingsDrawer(
  input: UnregisterTopSettingsDrawerInput
): Promise<UnregisterTopSettingsDrawerOutput> {
  const drawerId = sanitizeForId(input.id);
  const el = document.getElementById(drawerId);
  if (el) {
    el.remove();
  }

  const rec = topDrawers.get(input.id);
  if (rec?.cleanup) {
    rec.cleanup();
  }
  topDrawers.delete(input.id);

  return { ok: true };
}
