export type HookBroadcastTarget = 'st' | 'dom' | 'both';

export type HookInterceptTarget =
  | 'sendButton'
  | 'sendEnter'
  | 'optionsButton'
  | 'extensionsMenuButton'
  | 'regenerate'
  | 'continue'
  | 'impersonate'
  | 'stopButton';

export type HookObserveTarget =
  | 'generationLifecycle'
  | 'streamTokens'
  | 'stopButtonVisibility';

export type HookStEventName =
  | 'st_api_wrapper:intercept'
  | 'st_api_wrapper:generation.started'
  | 'st_api_wrapper:generation.stopped'
  | 'st_api_wrapper:generation.ended'
  | 'st_api_wrapper:generation.streamToken'
  | 'st_api_wrapper:ui.stopButtonShown'
  | 'st_api_wrapper:ui.stopButtonHidden';

export type HookDomEventName =
  | 'st-api-wrapper:intercept'
  | 'st-api-wrapper:generation.started'
  | 'st-api-wrapper:generation.stopped'
  | 'st-api-wrapper:generation.ended'
  | 'st-api-wrapper:generation.streamToken'
  | 'st-api-wrapper:ui.stopButtonShown'
  | 'st-api-wrapper:ui.stopButtonHidden';

export interface HookBroadcastOptions {
  /**
   * 广播到哪里：
   * - st: ctx.eventSource.emit
   * - dom: window.dispatchEvent(CustomEvent)
   * - both: 两者都发
   * @default 'both'
   */
  target?: HookBroadcastTarget;

  /**
   * ST eventSource 的事件名前缀（默认 st_api_wrapper）
   * @default 'st_api_wrapper'
   */
  stPrefix?: string;

  /**
   * DOM CustomEvent 的事件名前缀（默认 st-api-wrapper）
   * @default 'st-api-wrapper'
   */
  domPrefix?: string;
}

export interface HookInterceptOptions {
  /**
   * 要拦截哪些入口
   * @default ['sendButton','sendEnter','regenerate','continue','impersonate','stopButton']
   */
  targets?: HookInterceptTarget[];

  /**
   * 是否阻止默认行为（不让酒馆原生逻辑继续执行）
   * - boolean：全局开关（兼容旧版）
   * - object：按 target 细粒度控制（未写的 target 默认视为 true）
   * @default true
   */
  block?: boolean | Partial<Record<HookInterceptTarget, boolean>>;

  /**
   * 是否拦截 Enter 发送（仅 sendEnter 生效）：
   * - true：仅当酒馆设置为“按 Enter 发送”时才拦截
   * - false：只要按下 Enter 就拦截
   * @default true
   */
  onlyWhenSendOnEnter?: boolean;
}

export interface HookObserveOptions {
  /**
   * 要观察哪些事件源
   * @default ['generationLifecycle','streamTokens','stopButtonVisibility']
   */
  targets?: HookObserveTarget[];

  /**
   * 是否在 GENERATION_STARTED 时强制 stopGeneration()（兜底阻断“任何生成开始”）
   * @default false
   */
  blockGenerationOnStart?: boolean;

  /**
   * stop button 可见性观察：安装后是否立即发出一次当前状态
   * @default true
   */
  emitInitialStopButtonState?: boolean;
}

export interface InstallHooksInput {
  /** 唯一 ID，用于 uninstall/bypassOnce */
  id: string;

  /** 拦截配置（可不填） */
  intercept?: HookInterceptOptions;

  /** 观察配置（可不填） */
  observe?: HookObserveOptions;

  /** 广播配置（可不填） */
  broadcast?: HookBroadcastOptions;
}

export interface InstallHooksOutput {
  id: string;
  ok: true;
}

export interface UninstallHooksInput {
  id: string;
}

export interface UninstallHooksOutput {
  ok: boolean;
}

/**
 * 允许“放行一次默认行为”。
 *
 * 用法：先 bypassOnce，然后你自己触发对应按钮的 click（或调用酒馆原逻辑）。
 * 这样下一次命中的拦截会被跳过，避免递归。
 */
export interface BypassOnceInput {
  id: string;
  target: HookInterceptTarget | 'any';
}

export interface BypassOnceOutput {
  ok: boolean;
}

export type InterceptSource = 'click' | 'keydown';

export interface HookInterceptPayload {
  id: string;
  timestamp: number;
  source: InterceptSource;
  target: HookInterceptTarget;
  /** 命中的 DOM 选择器（便于调试） */
  selector: string;
  /** 是否被阻止默认行为 */
  blocked: boolean;
}

export interface HookGenerationStartedPayload {
  id: string;
  timestamp: number;
  generationType: string;
  options?: any;
  dryRun?: boolean;
}

export interface HookGenerationStoppedPayload {
  id: string;
  timestamp: number;
}

export interface HookGenerationEndedPayload {
  id: string;
  timestamp: number;
  chatLength?: number;
}

export interface HookStreamTokenPayload {
  id: string;
  timestamp: number;
  delta: string;
  full: string;
}

export interface HookStopButtonVisibilityPayload {
  id: string;
  timestamp: number;
  visible: boolean;
  display?: string;
}

