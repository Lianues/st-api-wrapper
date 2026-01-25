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
