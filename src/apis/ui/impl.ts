import type {
  ListSettingsPanelsOutput,
  RegisterSettingsPanelInput,
  RegisterSettingsPanelOutput,
  RegisterExtensionsMenuItemInput,
  RegisterExtensionsMenuItemOutput,
  UnregisterExtensionsMenuItemInput,
  UnregisterExtensionsMenuItemOutput,
  RegisterOptionsMenuItemInput,
  RegisterOptionsMenuItemOutput,
  UnregisterOptionsMenuItemInput,
  UnregisterOptionsMenuItemOutput,
  SettingsPanelTarget,
  UnregisterSettingsPanelInput,
  UnregisterSettingsPanelOutput,
  ReloadChatOutput,
  ReloadSettingsOutput,
  RegisterTopSettingsDrawerInput,
  RegisterTopSettingsDrawerOutput,
  UnregisterTopSettingsDrawerInput,
  UnregisterTopSettingsDrawerOutput,
  ScrollChatInput,
  ScrollChatOutput,
  RegisterMessageButtonInput,
  RegisterMessageButtonOutput,
  UnregisterMessageButtonInput,
  UnregisterMessageButtonOutput,
  RegisterExtraMessageButtonInput,
  RegisterExtraMessageButtonOutput,
  UnregisterExtraMessageButtonInput,
  UnregisterExtraMessageButtonOutput,
  RegisterMessageHeaderElementInput,
  RegisterMessageHeaderElementOutput,
  UnregisterMessageHeaderElementInput,
  UnregisterMessageHeaderElementOutput,
  MessageContext,
  SetSendBusyInput,
  SetSendBusyOutput,
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

/**
 * 注销扩展菜单项
 */
export async function unregisterExtensionsMenuItem(
  input: UnregisterExtensionsMenuItemInput
): Promise<UnregisterExtensionsMenuItemOutput> {
  const containerId = `${sanitizeForId(input.id)}_ext_container`;
  const el = document.getElementById(containerId);
  if (el) {
    el.remove();
  }
  return { ok: true };
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
 * 注销选项菜单项
 */
export async function unregisterOptionsMenuItem(
  input: UnregisterOptionsMenuItemInput
): Promise<UnregisterOptionsMenuItemOutput> {
  const itemId = sanitizeForId(input.id);
  const el = document.getElementById(itemId);
  if (el) {
    el.remove();
  }
  return { ok: true };
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
// Send Button Busy (发送按钮等待态)
// ============================================================================

const sendBusyOwners = new Set<string>();
let sendBusyOriginalIconClasses: string[] | null = null;

const FA_NON_ICON_NAME_CLASSES = new Set<string>([
  // base
  'fa',
  // styles
  'fa-solid',
  'fa-regular',
  'fa-light',
  'fa-thin',
  'fa-duotone',
  'fa-brands',
  'fa-sharp',
  'fa-sharp-solid',
  'fa-sharp-regular',
  'fa-sharp-light',
  'fa-sharp-thin',
  'fa-sharp-duotone',
  // modifiers / sizing
  'fa-fw',
  'fa-spin',
  'fa-spin-pulse',
  'fa-pulse',
  'fa-beat',
  'fa-fade',
  'fa-bounce',
  'fa-flip',
  'fa-shake',
  'fa-rotate-90',
  'fa-rotate-180',
  'fa-rotate-270',
  'fa-xs',
  'fa-sm',
  'fa-lg',
  'fa-xl',
  'fa-2xl',
  'fa-2x',
  'fa-3x',
  'fa-4x',
  'fa-5x',
  'fa-6x',
  'fa-7x',
  'fa-8x',
  'fa-9x',
  'fa-10x',
  'fa-border',
  'fa-inverse',
  'fa-stack',
  'fa-stack-1x',
  'fa-stack-2x',
  'fa-swap-opacity',
]);

function detectFaIconNameClasses(el: HTMLElement): string[] {
  return Array.from(el.classList).filter((c) => c.startsWith('fa-') && !FA_NON_ICON_NAME_CLASSES.has(c));
}

function applySendButtonBusyIcon(el: HTMLElement) {
  if (!sendBusyOriginalIconClasses) {
    const detected = detectFaIconNameClasses(el);
    // 兜底：酒馆默认发送按钮通常是 fa-paper-plane
    sendBusyOriginalIconClasses = detected.length > 0 ? detected : ['fa-paper-plane'];
  }

  // 移除当前 icon name，避免出现多个 icon class 叠加导致显示不确定
  detectFaIconNameClasses(el).forEach((c) => el.classList.remove(c));

  // busy icon
  el.classList.add('fa-solid');
  el.classList.add('fa-spinner');
  el.classList.add('fa-spin');
}

function restoreSendButtonBusyIcon(el: HTMLElement) {
  // 移除 busy icon
  el.classList.remove('fa-spinner');
  el.classList.remove('fa-spin');

  // 移除当前 icon name，再恢复原始 icon name
  detectFaIconNameClasses(el).forEach((c) => el.classList.remove(c));
  (sendBusyOriginalIconClasses ?? []).forEach((c) => el.classList.add(c));

  sendBusyOriginalIconClasses = null;
}

/**
 * 设置发送按钮等待态（不阻断发送逻辑，仅修改图标显示）
 *
 * - busy=true：将 #send_but 的 icon 临时替换为 spinner
 * - busy=false：恢复原 icon（引用计数：所有 owner 都释放后才恢复）
 */
export async function setSendBusy(input: SetSendBusyInput): Promise<SetSendBusyOutput> {
  const owner = String(input?.owner ?? '').trim();
  if (!owner) throw new Error('ui.setSendBusy requires a non-empty owner');
  const busy = Boolean(input?.busy);

  // 尽量等 UI 就绪（但不强依赖特定设置面板）
  if (!document.getElementById('send_but')) {
    await waitAppReady();
  }

  const el = document.getElementById('send_but') as HTMLElement | null;
  if (!el) throw new Error('Send button (#send_but) not found');

  const wasBusy = sendBusyOwners.size > 0;
  if (busy) {
    sendBusyOwners.add(owner);
  } else {
    sendBusyOwners.delete(owner);
  }
  const isBusy = sendBusyOwners.size > 0;

  if (!wasBusy && isBusy) {
    applySendButtonBusyIcon(el);
  } else if (wasBusy && !isBusy) {
    restoreSendButtonBusyIcon(el);
  }

  return { ok: true, busy: isBusy, owners: Array.from(sendBusyOwners) };
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

  // 创建 drawer-toggle
  const toggle = document.createElement('div');
  toggle.className = 'drawer-toggle';

  // 创建图标按钮（状态类由 updateVisualState 设置）
  const iconBtn = document.createElement('div');
  iconBtn.className = `drawer-icon ${input.icon} interactable`;
  if (input.title) {
    iconBtn.title = input.title;
  }
  iconBtn.tabIndex = 0;
  iconBtn.setAttribute('role', 'button');

  toggle.appendChild(iconBtn);

  // 创建 drawer-content（状态类由 updateVisualState 设置）
  const content = document.createElement('div');
  content.className = 'drawer-content';

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
      // 展开状态：使用 openDrawer 和 openIcon
      content.classList.remove('closedDrawer');
      content.classList.add('openDrawer');
      iconBtn.classList.remove('closedIcon');
      iconBtn.classList.add('openIcon');
    } else {
      // 关闭状态：使用 closedDrawer 和 closedIcon
      content.classList.remove('openDrawer');
      content.classList.add('closedDrawer');
      iconBtn.classList.remove('openIcon');
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

  const toggleDrawer = (e?: Event) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  // 初始状态
  updateVisualState();

  // 绑定点击事件到图标按钮（而不是整个 toggle 区域，避免被酒馆的全局处理器干扰）
  iconBtn.addEventListener('click', toggleDrawer);

  // 支持键盘操作
  iconBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
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

// ============================================================================
// Chat Scroll (聊天滚动)
// ============================================================================

/**
 * 滚动聊天记录
 *
 * 支持滚动到顶部、底部或指定消息位置。
 */
export async function scrollChat(
  input: ScrollChatInput
): Promise<ScrollChatOutput> {
  await waitAppReady();

  const chatContainer = document.getElementById('chat');
  if (!chatContainer) {
    return { ok: false };
  }

  const behavior = input.behavior ?? 'smooth';
  const target = input.target ?? 'bottom';

  if (target === 'bottom') {
    // 滚动到底部
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior,
    });
  } else if (target === 'top') {
    // 滚动到顶部
    chatContainer.scrollTo({
      top: 0,
      behavior,
    });
  } else if (typeof target === 'number') {
    // 滚动到指定消息
    const message = chatContainer.querySelector(`.mes[mesid="${target}"]`);
    if (message) {
      message.scrollIntoView({
        behavior,
        block: 'center',
      });
    } else {
      return { ok: false };
    }
  }

  return {
    ok: true,
    scrollTop: chatContainer.scrollTop,
  };
}

// ============================================================================
// Message Button (消息按钮)
// ============================================================================

/** 存储已注册的消息按钮配置 */
const messageButtons = new Map<string, RegisterMessageButtonInput>();

/** MutationObserver 实例，用于监听新消息 */
let messageObserver: MutationObserver | null = null;

/**
 * 为单个消息添加按钮
 */
function addButtonToMessage(
  mesElement: HTMLElement,
  config: RegisterMessageButtonInput
): void {
  const mesId = parseInt(mesElement.getAttribute('mesid') || '-1', 10);
  if (mesId < 0) return;

  const buttonsContainer = mesElement.querySelector('.mes_buttons');
  if (!buttonsContainer) return;

  // 检查是否已添加
  const buttonId = `st-api-mes-btn-${sanitizeForId(config.id)}`;
  if (buttonsContainer.querySelector(`[data-st-btn-id="${buttonId}"]`)) return;

  // 创建按钮
  const btn = document.createElement('div');
  btn.className = `mes_button ${config.icon} interactable`;
  btn.title = config.title;
  btn.tabIndex = 0;
  btn.setAttribute('role', 'button');
  btn.setAttribute('data-st-btn-id', buttonId);

  // 绑定点击事件
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    config.onClick(mesId, mesElement);
  });

  // 支持键盘操作
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      config.onClick(mesId, mesElement);
    }
  });

  // 计算插入位置
  // 默认按钮顺序: extraMesButtonsHint, extraMesButtons, mes_bookmark, mes_edit, [自定义按钮]
  // index 0 表示插入到 mes_edit 之后的第一个位置
  const existingCustomButtons = buttonsContainer.querySelectorAll('[data-st-btn-id]');
  const mesEditBtn = buttonsContainer.querySelector('.mes_edit');

  if (typeof config.index === 'number' && config.index >= 0) {
    // 找到正确的插入位置
    let targetIndex = config.index;
    let insertBefore: Element | null = null;

    // 获取所有自定义按钮并按 index 排序
    const customBtns = Array.from(existingCustomButtons);
    
    if (targetIndex < customBtns.length) {
      insertBefore = customBtns[targetIndex];
    } else if (mesEditBtn?.nextElementSibling) {
      // 如果 index 超出范围，插入到末尾
      insertBefore = null;
    }

    if (insertBefore) {
      buttonsContainer.insertBefore(btn, insertBefore);
    } else if (mesEditBtn) {
      // 插入到 mes_edit 之后
      mesEditBtn.insertAdjacentElement('afterend', btn);
    } else {
      buttonsContainer.appendChild(btn);
    }
  } else {
    // 默认追加到末尾
    if (mesEditBtn) {
      mesEditBtn.insertAdjacentElement('afterend', btn);
    } else {
      buttonsContainer.appendChild(btn);
    }
  }
}

/**
 * 从单个消息移除按钮
 */
function removeButtonFromMessage(
  mesElement: HTMLElement,
  buttonId: string
): boolean {
  const btn = mesElement.querySelector(`[data-st-btn-id="st-api-mes-btn-${sanitizeForId(buttonId)}"]`);
  if (btn) {
    btn.remove();
    return true;
  }
  return false;
}

/**
 * 为所有现有消息添加按钮
 */
function applyButtonToAllMessages(config: RegisterMessageButtonInput): number {
  const messages = document.querySelectorAll('#chat .mes');
  let count = 0;
  messages.forEach((mes) => {
    addButtonToMessage(mes as HTMLElement, config);
    count++;
  });
  return count;
}

/**
 * 确保 MutationObserver 正在运行
 */
function ensureMessageObserver(): void {
  if (messageObserver) return;

  const chatContainer = document.getElementById('chat');
  if (!chatContainer) return;

  messageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.classList.contains('mes')) {
          // 为新消息添加所有已注册的按钮
          messageButtons.forEach((config) => {
            addButtonToMessage(node, config);
          });
          // 为新消息添加所有已注册的扩展按钮
          extraMessageButtons.forEach((config) => {
            addExtraButtonToMessage(node, config);
          });
          // 为新消息添加所有已注册的标题元素
          messageHeaderElements.forEach((config) => {
            addHeaderElementToMessage(node, config);
          });
        }
      });
    });
  });

  messageObserver.observe(chatContainer, { childList: true });
}

/**
 * 注册消息按钮
 */
export async function registerMessageButton(
  input: RegisterMessageButtonInput
): Promise<RegisterMessageButtonOutput> {
  await waitAppReady();

  if (messageButtons.has(input.id)) {
    throw new Error(`Message button ID already registered: ${input.id}`);
  }

  // 保存配置
  messageButtons.set(input.id, input);

  // 确保观察器运行
  ensureMessageObserver();

  // 应用到所有现有消息
  const appliedCount = applyButtonToAllMessages(input);

  return {
    id: input.id,
    appliedCount,
  };
}

/**
 * 注销消息按钮
 */
export async function unregisterMessageButton(
  input: UnregisterMessageButtonInput
): Promise<UnregisterMessageButtonOutput> {
  // 从所有消息中移除按钮
  const messages = document.querySelectorAll('#chat .mes');
  let removedCount = 0;
  messages.forEach((mes) => {
    if (removeButtonFromMessage(mes as HTMLElement, input.id)) {
      removedCount++;
    }
  });

  // 从注册表中移除
  messageButtons.delete(input.id);

  // 如果没有更多注册的按钮，可以停止观察器
  if (messageButtons.size === 0 && extraMessageButtons.size === 0 && messageObserver) {
    messageObserver.disconnect();
    messageObserver = null;
  }

  return {
    ok: true,
    removedCount,
  };
}

// ============================================================================
// Extra Message Button (扩展消息按钮，在 ... 菜单内)
// ============================================================================

/** 存储已注册的扩展消息按钮配置 */
const extraMessageButtons = new Map<string, RegisterExtraMessageButtonInput>();

/**
 * 为单个消息添加扩展按钮（在 .extraMesButtons 内）
 */
function addExtraButtonToMessage(
  mesElement: HTMLElement,
  config: RegisterExtraMessageButtonInput
): void {
  const mesId = parseInt(mesElement.getAttribute('mesid') || '-1', 10);
  if (mesId < 0) return;

  const extraButtonsContainer = mesElement.querySelector('.extraMesButtons');
  if (!extraButtonsContainer) return;

  // 检查是否已添加
  const buttonId = `st-api-extra-btn-${sanitizeForId(config.id)}`;
  if (extraButtonsContainer.querySelector(`[data-st-btn-id="${buttonId}"]`)) return;

  // 创建按钮
  const btn = document.createElement('div');
  btn.className = `mes_button ${config.icon} interactable`;
  btn.title = config.title;
  btn.tabIndex = 0;
  btn.setAttribute('role', 'button');
  btn.setAttribute('data-st-btn-id', buttonId);
  btn.setAttribute('data-i18n', `[title]${config.title}`);

  // 绑定点击事件
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    config.onClick(mesId, mesElement);
  });

  // 支持键盘操作
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      config.onClick(mesId, mesElement);
    }
  });

  // 计算插入位置
  if (typeof config.index === 'number' && config.index >= 0) {
    const children = extraButtonsContainer.children;
    if (config.index < children.length) {
      extraButtonsContainer.insertBefore(btn, children[config.index]);
    } else {
      extraButtonsContainer.appendChild(btn);
    }
  } else {
    // 默认追加到末尾
    extraButtonsContainer.appendChild(btn);
  }
}

/**
 * 从单个消息移除扩展按钮
 */
function removeExtraButtonFromMessage(
  mesElement: HTMLElement,
  buttonId: string
): boolean {
  const btn = mesElement.querySelector(`[data-st-btn-id="st-api-extra-btn-${sanitizeForId(buttonId)}"]`);
  if (btn) {
    btn.remove();
    return true;
  }
  return false;
}

/**
 * 为所有现有消息添加扩展按钮
 */
function applyExtraButtonToAllMessages(config: RegisterExtraMessageButtonInput): number {
  const messages = document.querySelectorAll('#chat .mes');
  let count = 0;
  messages.forEach((mes) => {
    addExtraButtonToMessage(mes as HTMLElement, config);
    count++;
  });
  return count;
}

/**
 * 注册扩展消息按钮
 */
export async function registerExtraMessageButton(
  input: RegisterExtraMessageButtonInput
): Promise<RegisterExtraMessageButtonOutput> {
  await waitAppReady();

  if (extraMessageButtons.has(input.id)) {
    throw new Error(`Extra message button ID already registered: ${input.id}`);
  }

  // 保存配置
  extraMessageButtons.set(input.id, input);

  // 确保观察器运行
  ensureMessageObserver();

  // 应用到所有现有消息
  const appliedCount = applyExtraButtonToAllMessages(input);

  return {
    id: input.id,
    appliedCount,
  };
}

/**
 * 注销扩展消息按钮
 */
export async function unregisterExtraMessageButton(
  input: UnregisterExtraMessageButtonInput
): Promise<UnregisterExtraMessageButtonOutput> {
  // 从所有消息中移除按钮
  const messages = document.querySelectorAll('#chat .mes');
  let removedCount = 0;
  messages.forEach((mes) => {
    if (removeExtraButtonFromMessage(mes as HTMLElement, input.id)) {
      removedCount++;
    }
  });

  // 从注册表中移除
  extraMessageButtons.delete(input.id);

  // 如果没有更多注册的按钮，可以停止观察器
  if (messageButtons.size === 0 && extraMessageButtons.size === 0 && messageHeaderElements.size === 0 && messageObserver) {
    messageObserver.disconnect();
    messageObserver = null;
  }

  return {
    ok: true,
    removedCount,
  };
}

// ============================================================================
// Message Header Element (消息标题区域元素)
// ============================================================================

/** 存储已注册的消息标题元素配置 */
const messageHeaderElements = new Map<string, RegisterMessageHeaderElementInput>();

/**
 * 获取消息上下文信息
 */
function getMessageContext(mesElement: HTMLElement): MessageContext | null {
  const mesId = parseInt(mesElement.getAttribute('mesid') || '-1', 10);
  if (mesId < 0) return null;

  const isUser = mesElement.getAttribute('is_user') === 'true';
  const isSystem = mesElement.getAttribute('is_system') === 'true';
  const characterName = mesElement.getAttribute('ch_name') || '';

  let role: 'user' | 'assistant' | 'system';
  if (isSystem) {
    role = 'system';
  } else if (isUser) {
    role = 'user';
  } else {
    role = 'assistant';
  }

  return {
    mesId,
    role,
    characterName,
    isUser,
    isSystem,
    messageElement: mesElement,
  };
}

/**
 * 为单个消息添加标题元素
 */
function addHeaderElementToMessage(
  mesElement: HTMLElement,
  config: RegisterMessageHeaderElementInput
): void {
  const context = getMessageContext(mesElement);
  if (!context) return;

  // 检查角色过滤
  const roleFilter = config.roleFilter ?? 'all';
  if (roleFilter !== 'all' && roleFilter !== context.role) return;

  // 检查自定义过滤
  if (config.filter && !config.filter(context)) return;

  // 找到标题区域容器
  const headerContainer = mesElement.querySelector('.ch_name .flex-container.alignItemsBaseline');
  if (!headerContainer) return;

  // 检查是否已添加
  const elementId = `st-api-header-${sanitizeForId(config.id)}`;
  if (headerContainer.querySelector(`[data-st-header-id="${elementId}"]`)) return;

  // 渲染元素
  const element = config.render(context);
  if (!element) return;

  // 添加标识
  element.setAttribute('data-st-header-id', elementId);

  // 计算插入位置
  const position = config.position ?? 'afterName';
  const nameText = headerContainer.querySelector('.name_text');
  const timestamp = headerContainer.querySelector('.timestamp');

  if (position === 'afterName' && nameText) {
    nameText.insertAdjacentElement('afterend', element);
  } else if (position === 'beforeTimestamp' && timestamp) {
    timestamp.insertAdjacentElement('beforebegin', element);
  } else if (position === 'afterTimestamp' && timestamp) {
    timestamp.insertAdjacentElement('afterend', element);
  } else if (typeof position === 'number') {
    const children = headerContainer.children;
    if (position < children.length) {
      headerContainer.insertBefore(element, children[position]);
    } else {
      headerContainer.appendChild(element);
    }
  } else {
    // 默认追加到末尾
    headerContainer.appendChild(element);
  }
}

/**
 * 从单个消息移除标题元素
 */
function removeHeaderElementFromMessage(
  mesElement: HTMLElement,
  elementId: string
): boolean {
  const el = mesElement.querySelector(`[data-st-header-id="st-api-header-${sanitizeForId(elementId)}"]`);
  if (el) {
    el.remove();
    return true;
  }
  return false;
}

/**
 * 为所有现有消息添加标题元素
 */
function applyHeaderElementToAllMessages(config: RegisterMessageHeaderElementInput): number {
  const messages = document.querySelectorAll('#chat .mes');
  let count = 0;
  messages.forEach((mes) => {
    addHeaderElementToMessage(mes as HTMLElement, config);
    count++;
  });
  return count;
}

/**
 * 注册消息标题元素
 */
export async function registerMessageHeaderElement(
  input: RegisterMessageHeaderElementInput
): Promise<RegisterMessageHeaderElementOutput> {
  await waitAppReady();

  if (messageHeaderElements.has(input.id)) {
    throw new Error(`Message header element ID already registered: ${input.id}`);
  }

  // 保存配置
  messageHeaderElements.set(input.id, input);

  // 确保观察器运行
  ensureMessageObserver();

  // 应用到所有现有消息
  const appliedCount = applyHeaderElementToAllMessages(input);

  return {
    id: input.id,
    appliedCount,
  };
}

/**
 * 注销消息标题元素
 */
export async function unregisterMessageHeaderElement(
  input: UnregisterMessageHeaderElementInput
): Promise<UnregisterMessageHeaderElementOutput> {
  // 从所有消息中移除元素
  const messages = document.querySelectorAll('#chat .mes');
  let removedCount = 0;
  messages.forEach((mes) => {
    if (removeHeaderElementFromMessage(mes as HTMLElement, input.id)) {
      removedCount++;
    }
  });

  // 从注册表中移除
  messageHeaderElements.delete(input.id);

  // 如果没有更多注册的项，可以停止观察器
  if (messageButtons.size === 0 && extraMessageButtons.size === 0 && messageHeaderElements.size === 0 && messageObserver) {
    messageObserver.disconnect();
    messageObserver = null;
  }

  return {
    ok: true,
    removedCount,
  };
}
