export type SettingsPanelTarget = 'left' | 'right' | string;

export type SettingsPanelContent =
  | {
      kind: 'html';
      /** HTML 字符串，会被直接写入 content 容器 */
      html: string;
    }
  | {
      kind: 'htmlTemplate';
      /**
       * 兼容 st-extension-example 这种“整块 inline-drawer 模板”的 HTML。
       * 会优先提取模板中的 `.inline-drawer-content` 作为面板内容。
       * 若找不到 `.inline-drawer-content`，则退化为按普通 html 处理。
       */
      html: string;
      /** 可选：自定义提取选择器，默认 `.inline-drawer-content` */
      extractSelector?: string;
    }
  | {
      kind: 'element';
      /** 传入一个 DOM 元素，会被 append 到 content 容器 */
      element: HTMLElement;
    }
  | {
      kind: 'render';
      /**
       * 传入一个渲染函数，用于完全自定义渲染逻辑。
       * 可返回 cleanup 函数，用于 unregister 时清理事件监听等。
       */
      render: (container: HTMLElement) => void | (() => void) | Promise<void | (() => void)>;
    };

export interface RegisterSettingsPanelInput {
  /** 唯一 ID（建议使用反向域名/前缀防冲突，例如 myext.settings） */
  id: string;

  /** 设置面板标题 */
  title: string;

  /**
   * 挂载位置：默认 'right'。
   * - 'left'  -> 左侧设置列 (#extensions_settings)
   * - 'right' -> 右侧设置列 (#extensions_settings2)
   * - 也可以直接传 CSS 选择器，如 '#extensions_settings'
   */
  target?: SettingsPanelTarget;

  /** 内容渲染方式 */
  content: SettingsPanelContent;

  /** 是否默认展开（默认 false） */
  expanded?: boolean;

  /**
   * 插入位置（可选，0 为最顶端，默认追加到末尾）。
   * 如果设置了此值，将忽略 order 排序。
   */
  index?: number;

  /**
   * 排序权重（越小越靠前）。
   * 仅在未设置 index 时有效。
   */
  order?: number;

  /** 额外 className，会加到 drawer 根节点上 */
  className?: string;
}

export interface RegisterSettingsPanelOutput {
  id: string;
  /** 面板挂载到的 container id */
  containerId: string;
  /** drawer 根元素（.inline-drawer） */
  drawer: HTMLElement;
  /** 内容容器（.inline-drawer-content） */
  content: HTMLElement;
}

export interface UnregisterSettingsPanelInput {
  id: string;
}

export interface UnregisterSettingsPanelOutput {
  ok: true;
}

export interface ListSettingsPanelsInput {
  target?: SettingsPanelTarget;
}

export interface ListSettingsPanelsOutput {
  panels: Array<{ id: string; title: string; order: number; target: string }>;
}

export interface RegisterExtensionsMenuItemInput {
  /** 唯一 ID */
  id: string;
  /** 显示文本 */
  label: string;
  /** 图标类名，例如 "fa-solid fa-wand-magic-sparkles" */
  icon: string;
  /** 点击回调 */
  onClick: () => void | Promise<void>;
  /** 插入位置（可选，0 为最顶端，默认追加到末尾） */
  index?: number;
}

export interface RegisterExtensionsMenuItemOutput {
  itemId: string;
}

export interface UnregisterExtensionsMenuItemInput {
  /** 要注销的菜单项 ID（与注册时使用的 ID 相同） */
  id: string;
}

export interface UnregisterExtensionsMenuItemOutput {
  ok: true;
}

export interface RegisterOptionsMenuItemInput {
  /** 唯一 ID */
  id: string;
  /** 显示文本 */
  label: string;
  /** 图标类名，例如 "fa-solid fa-cog" */
  icon: string;
  /** 点击回调 */
  onClick: () => void | Promise<void>;
  /** 插入位置（可选，0 为最顶端，默认追加到末尾） */
  index?: number;
}

export interface RegisterOptionsMenuItemOutput {
  itemId: string;
}

export interface UnregisterOptionsMenuItemInput {
  /** 要注销的菜单项 ID（与注册时使用的 ID 相同） */
  id: string;
}

export interface UnregisterOptionsMenuItemOutput {
  ok: true;
}

export interface ReloadChatOutput {
  ok: boolean;
}

export interface ReloadSettingsOutput {
  ok: boolean;
}

// ============================================================================
// Top Settings Drawer (顶部设置抽屉，类似 #sys-settings-button)
// ============================================================================

/**
 * 顶部设置抽屉的内容渲染方式
 */
export type TopSettingsDrawerContent =
  | {
      kind: 'html';
      /** HTML 字符串，会被直接写入 drawer-content 容器 */
      html: string;
    }
  | {
      kind: 'element';
      /** 传入一个 DOM 元素，会被 append 到 drawer-content 容器 */
      element: HTMLElement;
    }
  | {
      kind: 'render';
      /**
       * 传入一个渲染函数，用于完全自定义渲染逻辑。
       * 可返回 cleanup 函数，用于 unregister 时清理事件监听等。
       */
      render: (container: HTMLElement) => void | (() => void) | Promise<void | (() => void)>;
    };

/**
 * 注册顶部设置抽屉的输入参数
 */
export interface RegisterTopSettingsDrawerInput {
  /**
   * 唯一 ID（建议使用反向域名/前缀防冲突，例如 myext.top-drawer）
   */
  id: string;

  /**
   * 图标类名，例如 "fa-solid fa-plug-circle-exclamation"
   * 会显示在 drawer-toggle 按钮上
   */
  icon: string;

  /**
   * 鼠标悬停提示文本
   */
  title?: string;

  /**
   * 面板内容渲染方式
   */
  content: TopSettingsDrawerContent;

  /**
   * 插入位置，从左到右从 0 开始计数
   * （0 为最左侧，默认追加到最右侧末尾）
   */
  index?: number;

  /**
   * 额外的 CSS 类名，会加到 drawer 根节点上
   */
  className?: string;

  /**
   * 初始状态是否展开（默认 false）
   */
  expanded?: boolean;

  /**
   * 当抽屉打开时的回调
   */
  onOpen?: () => void | Promise<void>;

  /**
   * 当抽屉关闭时的回调
   */
  onClose?: () => void | Promise<void>;
}

/**
 * 注册顶部设置抽屉的输出
 */
export interface RegisterTopSettingsDrawerOutput {
  /** 注册的 ID */
  id: string;
  /** drawer 容器的 DOM ID */
  drawerId: string;
  /** drawer 根元素 */
  drawer: HTMLElement;
  /** drawer-content 容器元素 */
  content: HTMLElement;
  /** 切换抽屉开关状态的方法 */
  toggle: () => void;
  /** 打开抽屉 */
  open: () => void;
  /** 关闭抽屉 */
  close: () => void;
}

/**
 * 注销顶部设置抽屉的输入参数
 */
export interface UnregisterTopSettingsDrawerInput {
  id: string;
}

/**
 * 注销顶部设置抽屉的输出
 */
export interface UnregisterTopSettingsDrawerOutput {
  ok: true;
}

// ============================================================================
// Chat Scroll (聊天滚动)
// ============================================================================

/**
 * 滚动行为类型
 */
export type ScrollBehavior = 'smooth' | 'instant';

/**
 * 滚动聊天记录的输入参数
 */
export interface ScrollChatInput {
  /**
   * 滚动行为：
   * - 'smooth': 平滑滚动（默认）
   * - 'instant': 立即滚动
   */
  behavior?: ScrollBehavior;

  /**
   * 滚动目标：
   * - 'bottom': 滚动到底部（默认）
   * - 'top': 滚动到顶部
   * - number: 滚动到指定消息 ID（mesid）
   */
  target?: 'bottom' | 'top' | number;
}

/**
 * 滚动聊天记录的输出
 */
export interface ScrollChatOutput {
  ok: boolean;
  /** 滚动后的位置 */
  scrollTop?: number;
}

// ============================================================================
// Message Button (消息按钮)
// ============================================================================

/**
 * 注册消息按钮的输入参数
 */
export interface RegisterMessageButtonInput {
  /**
   * 唯一 ID（建议使用 插件名.按钮名 格式）
   */
  id: string;

  /**
   * FontAwesome 图标类名，例如 "fa-solid fa-star"
   */
  icon: string;

  /**
   * 鼠标悬停提示文本
   */
  title: string;

  /**
   * 插入位置，从左到右从 0 开始计数
   * （0 为最左侧，默认追加到末尾，在 Edit 按钮之后）
   */
  index?: number;

  /**
   * 点击回调函数
   * @param mesId 消息 ID（mesid 属性值）
   * @param messageElement 消息元素（.mes）
   */
  onClick: (mesId: number, messageElement: HTMLElement) => void | Promise<void>;
}

/**
 * 注册消息按钮的输出
 */
export interface RegisterMessageButtonOutput {
  /** 注册的按钮 ID */
  id: string;
  /** 当前已添加按钮的消息数量 */
  appliedCount: number;
}

/**
 * 注销消息按钮的输入参数
 */
export interface UnregisterMessageButtonInput {
  /** 要注销的按钮 ID（与注册时使用的 ID 相同） */
  id: string;
}

/**
 * 注销消息按钮的输出
 */
export interface UnregisterMessageButtonOutput {
  ok: true;
  /** 移除按钮的消息数量 */
  removedCount: number;
}

// ============================================================================
// Extra Message Button (扩展消息按钮，在 ... 菜单内)
// ============================================================================

/**
 * 注册扩展消息按钮的输入参数
 */
export interface RegisterExtraMessageButtonInput {
  /**
   * 唯一 ID（建议使用 插件名.按钮名 格式）
   */
  id: string;

  /**
   * FontAwesome 图标类名，例如 "fa-solid fa-star"
   */
  icon: string;

  /**
   * 鼠标悬停提示文本
   */
  title: string;

  /**
   * 插入位置，从上到下从 0 开始计数
   * （0 为最顶部，默认追加到末尾）
   */
  index?: number;

  /**
   * 点击回调函数
   * @param mesId 消息 ID（mesid 属性值）
   * @param messageElement 消息元素（.mes）
   */
  onClick: (mesId: number, messageElement: HTMLElement) => void | Promise<void>;
}

/**
 * 注册扩展消息按钮的输出
 */
export interface RegisterExtraMessageButtonOutput {
  /** 注册的按钮 ID */
  id: string;
  /** 当前已添加按钮的消息数量 */
  appliedCount: number;
}

/**
 * 注销扩展消息按钮的输入参数
 */
export interface UnregisterExtraMessageButtonInput {
  /** 要注销的按钮 ID（与注册时使用的 ID 相同） */
  id: string;
}

/**
 * 注销扩展消息按钮的输出
 */
export interface UnregisterExtraMessageButtonOutput {
  ok: true;
  /** 移除按钮的消息数量 */
  removedCount: number;
}

// ============================================================================
// Message Header Element (消息标题区域元素)
// ============================================================================

/**
 * 消息上下文信息
 */
export interface MessageContext {
  /** 消息 ID（mesid 属性值） */
  mesId: number;
  /** 消息角色：'user' | 'assistant' | 'system' */
  role: 'user' | 'assistant' | 'system';
  /** 角色名称（ch_name 属性值） */
  characterName: string;
  /** 是否是用户消息 */
  isUser: boolean;
  /** 是否是系统消息 */
  isSystem: boolean;
  /** 消息元素（.mes） */
  messageElement: HTMLElement;
}

/**
 * 消息角色过滤器
 */
export type MessageRoleFilter = 'user' | 'assistant' | 'system' | 'all';

/**
 * 插入位置
 */
export type MessageHeaderPosition = 'afterName' | 'beforeTimestamp' | 'afterTimestamp' | number;

/**
 * 注册消息标题元素的输入参数
 */
export interface RegisterMessageHeaderElementInput {
  /**
   * 唯一 ID（建议使用 插件名.元素名 格式）
   */
  id: string;

  /**
   * 插入位置：
   * - 'afterName': 在角色名之后（默认）
   * - 'beforeTimestamp': 在时间戳之前
   * - 'afterTimestamp': 在时间戳之后
   * - number: 从左到右的索引位置（0 为最左侧）
   */
  position?: MessageHeaderPosition;

  /**
   * 角色过滤器，决定元素显示在哪些消息上
   * - 'user': 仅用户消息
   * - 'assistant': 仅助手消息
   * - 'system': 仅系统消息
   * - 'all': 所有消息（默认）
   */
  roleFilter?: MessageRoleFilter;

  /**
   * 自定义过滤函数（可选）
   * 返回 true 表示显示，false 表示不显示
   */
  filter?: (context: MessageContext) => boolean;

  /**
   * 渲染函数，返回要插入的 HTML 元素
   * @param context 消息上下文
   * @returns HTML 元素或 null（不显示）
   */
  render: (context: MessageContext) => HTMLElement | null;
}

/**
 * 注册消息标题元素的输出
 */
export interface RegisterMessageHeaderElementOutput {
  /** 注册的元素 ID */
  id: string;
  /** 当前已添加元素的消息数量 */
  appliedCount: number;
}

/**
 * 注销消息标题元素的输入参数
 */
export interface UnregisterMessageHeaderElementInput {
  /** 要注销的元素 ID（与注册时使用的 ID 相同） */
  id: string;
}

/**
 * 注销消息标题元素的输出
 */
export interface UnregisterMessageHeaderElementOutput {
  ok: true;
  /** 移除元素的消息数量 */
  removedCount: number;
}
