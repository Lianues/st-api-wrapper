import type {
  BypassOnceInput,
  BypassOnceOutput,
  HookBroadcastOptions,
  HookInterceptPayload,
  HookInterceptTarget,
  HookInterceptOptions,
  HookObserveOptions,
  HookStopButtonVisibilityPayload,
  HookStreamTokenPayload,
  HookGenerationStartedPayload,
  HookGenerationStoppedPayload,
  HookGenerationEndedPayload,
  InstallHooksInput,
  InstallHooksOutput,
  UninstallHooksInput,
  UninstallHooksOutput,
} from './types';

type HookRuntime = {
  id: string;
  broadcast: Required<HookBroadcastOptions>;
  intercept: Required<HookInterceptOptions>;
  observe: Required<HookObserveOptions>;
  bypassOnce: Map<HookInterceptTarget | 'any', boolean>;
  streamFull: string;
  lastStopVisible: boolean | undefined;
  stopObserver?: MutationObserver;
  cleanup: () => void;
};

const installs = new Map<string, HookRuntime>();

function resolveCtx(): any {
  return (window as any).SillyTavern?.getContext?.();
}

/**
 * 等待 APP_READY（尽量复用 ST 的生命周期，避免过早绑定导致找不到 DOM）
 */
async function waitAppReady(): Promise<void> {
  const ctx = resolveCtx();
  if (!ctx) return;

  const { eventSource, event_types } = ctx;

  // 快速路径：核心输入栏已存在（通常意味着 UI 就绪）
  if (document.getElementById('send_but') || document.getElementById('send_textarea')) {
    return;
  }

  return await new Promise((resolve) => {
    const done = () => {
      eventSource.removeListener(event_types.APP_READY, done);
      resolve();
    };
    eventSource.on(event_types.APP_READY, done);
    setTimeout(done, 5000);
  });
}

function defaults<T extends Record<string, any>>(base: T, next?: Partial<T>): T {
  return { ...base, ...(next ?? {}) };
}

function makeStEventName(prefix: string, suffix: string): string {
  return `${prefix}:${suffix}`;
}

function makeDomEventName(prefix: string, suffix: string): string {
  return `${prefix}:${suffix}`;
}

function emitBoth(rt: HookRuntime, suffix: string, payload: any) {
  const ctx = resolveCtx();
  const eventSource = ctx?.eventSource;

  const stPrefix = rt.broadcast.stPrefix;
  const domPrefix = rt.broadcast.domPrefix;
  const target = rt.broadcast.target;

  if ((target === 'st' || target === 'both') && eventSource?.emit) {
    // fire-and-forget; EventEmitter catches listener errors internally
    void eventSource.emit(makeStEventName(stPrefix, suffix), payload);
  }

  if (target === 'dom' || target === 'both') {
    try {
      if (typeof (window as any).CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent(makeDomEventName(domPrefix, suffix), { detail: payload }));
      }
    } catch {
      // ignore
    }
  }
}

function shouldBypass(rt: HookRuntime, target: HookInterceptTarget): boolean {
  if (rt.bypassOnce.get('any')) {
    rt.bypassOnce.delete('any');
    return true;
  }
  if (rt.bypassOnce.get(target)) {
    rt.bypassOnce.delete(target);
    return true;
  }
  return false;
}

function shouldBlock(rt: HookRuntime, target: HookInterceptTarget): boolean {
  const b: any = rt.intercept.block;
  if (typeof b === 'boolean') return b;
  if (b && typeof b === 'object') {
    const v = b[target];
    return v === undefined ? true : Boolean(v);
  }
  return true;
}

function stopEvent(e: Event) {
  // capture-phase hard block so jQuery bubble listeners won't run
  try {
    e.preventDefault();
  } catch {
    // ignore
  }
  // stopImmediatePropagation is the most effective here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e as any).stopImmediatePropagation?.();
  e.stopPropagation();
}

function isEnterSendEnabled(ctx: any): boolean {
  const raw = ctx?.shouldSendOnEnter;
  if (typeof raw === 'function') {
    try {
      return Boolean(raw());
    } catch {
      return false;
    }
  }
  return Boolean(raw);
}

function getStopButtonEl(): HTMLElement | null {
  return (document.getElementById('mes_stop') as HTMLElement | null) ?? (document.querySelector('.mes_stop') as HTMLElement | null);
}

function computeStopVisible(el: HTMLElement | null): { visible: boolean; display?: string } {
  if (!el) return { visible: false };
  try {
    const display = window.getComputedStyle(el).display;
    return { visible: display !== 'none', display };
  } catch {
    return { visible: true };
  }
}

export async function install(input: InstallHooksInput): Promise<InstallHooksOutput> {
  const id = String(input?.id || '').trim();
  if (!id) throw new Error('hooks.install requires a non-empty id');
  if (installs.has(id)) throw new Error(`hooks.install duplicate id: ${id}`);

  await waitAppReady();

  const rt: HookRuntime = {
    id,
    broadcast: defaults(
      { target: 'both' as const, stPrefix: 'st_api_wrapper', domPrefix: 'st-api-wrapper' },
      input?.broadcast
    ),
    intercept: defaults(
      {
        targets: ['sendButton', 'sendEnter', 'regenerate', 'continue', 'impersonate', 'stopButton'],
        block: true,
        onlyWhenSendOnEnter: true,
      },
      input?.intercept
    ),
    observe: defaults(
      {
        targets: ['generationLifecycle', 'streamTokens', 'stopButtonVisibility'],
        blockGenerationOnStart: false,
        emitInitialStopButtonState: true,
      },
      input?.observe
    ),
    bypassOnce: new Map(),
    streamFull: '',
    lastStopVisible: undefined,
    cleanup: () => {},
  };

  const disposers: Array<() => void> = [];

  // ---------------------------------------------------------------------------
  // Intercept (DOM)
  // ---------------------------------------------------------------------------
  const interceptTargets = new Set(rt.intercept.targets ?? []);

  const emitIntercept = (payload: HookInterceptPayload) => {
    emitBoth(rt, 'intercept', payload);
  };

  const onDocClickCapture = (e: MouseEvent) => {
    if (!rt.intercept.block && !rt.broadcast.target) return;
    const t = e.target as Element | null;
    if (!t || !(t as any).closest) return;

    const hit = (selector: string, target: HookInterceptTarget): boolean => {
      if (!interceptTargets.has(target)) return false;
      const el = t.closest(selector);
      if (!el) return false;
      if (shouldBypass(rt, target)) return false;

      const blocked = shouldBlock(rt, target);
      if (blocked) stopEvent(e);

      emitIntercept({
        id: rt.id,
        timestamp: Date.now(),
        source: 'click',
        target,
        selector,
        blocked,
      });

      return true;
    };

    // Order matters: more specific first
    if (hit('#send_but', 'sendButton')) return;
    if (hit('#options_button', 'optionsButton')) return;
    if (hit('#extensionsMenuButton', 'extensionsMenuButton')) return;
    if (hit('#option_regenerate', 'regenerate')) return;
    if (hit('#option_continue, #mes_continue', 'continue')) return;
    if (hit('#mes_impersonate', 'impersonate')) return;
    if (hit('#mes_stop, .mes_stop', 'stopButton')) return;
  };

  const onDocKeydownCapture = (e: KeyboardEvent) => {
    if (!interceptTargets.has('sendEnter')) return;
    if (e.key !== 'Enter') return;
    // Avoid interfering with IME composition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any).isComposing || (e as any).keyCode === 229) return;
    // Typical UX: Shift+Enter for newline
    if (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return;

    const targetEl = e.target as HTMLElement | null;
    if (!targetEl) return;
    if (!(targetEl instanceof HTMLTextAreaElement)) return;
    if (targetEl.id !== 'send_textarea') return;

    const ctx = resolveCtx();
    if (rt.intercept.onlyWhenSendOnEnter && !isEnterSendEnabled(ctx)) return;
    if (shouldBypass(rt, 'sendEnter')) return;

    const blocked = shouldBlock(rt, 'sendEnter');
    if (blocked) stopEvent(e);

    emitIntercept({
      id: rt.id,
      timestamp: Date.now(),
      source: 'keydown',
      target: 'sendEnter',
      selector: '#send_textarea',
      blocked,
    });
  };

  document.addEventListener('click', onDocClickCapture, true);
  disposers.push(() => document.removeEventListener('click', onDocClickCapture, true));

  document.addEventListener('keydown', onDocKeydownCapture, true);
  disposers.push(() => document.removeEventListener('keydown', onDocKeydownCapture, true));

  // ---------------------------------------------------------------------------
  // Observe (ST eventSource)
  // ---------------------------------------------------------------------------
  const ctx = resolveCtx();
  const eventSource = ctx?.eventSource;
  const event_types = ctx?.event_types;

  const observeTargets = new Set(rt.observe.targets ?? []);

  if (eventSource?.on && event_types) {
    const onStarted = (type: any, options: any, dryRun: any) => {
      rt.streamFull = '';
      const payload: HookGenerationStartedPayload = {
        id: rt.id,
        timestamp: Date.now(),
        generationType: String(type ?? ''),
        options,
        dryRun,
      };
      emitBoth(rt, 'generation.started', payload);

      if (rt.observe.blockGenerationOnStart && dryRun !== true) {
        try {
          ctx?.stopGeneration?.();
        } catch {
          // ignore
        }
      }
    };

    const onStopped = () => {
      const payload: HookGenerationStoppedPayload = {
        id: rt.id,
        timestamp: Date.now(),
      };
      emitBoth(rt, 'generation.stopped', payload);
    };

    const onEnded = (chatLength: any) => {
      const payload: HookGenerationEndedPayload = {
        id: rt.id,
        timestamp: Date.now(),
        chatLength: typeof chatLength === 'number' ? chatLength : undefined,
      };
      emitBoth(rt, 'generation.ended', payload);
    };

    const onStreamToken = (delta: any) => {
      const d = typeof delta === 'string' ? delta : String(delta ?? '');
      if (!d) return;
      rt.streamFull += d;
      const payload: HookStreamTokenPayload = {
        id: rt.id,
        timestamp: Date.now(),
        delta: d,
        full: rt.streamFull,
      };
      emitBoth(rt, 'generation.streamToken', payload);
    };

    if (observeTargets.has('generationLifecycle')) {
      eventSource.on(event_types.GENERATION_STARTED, onStarted);
      eventSource.on(event_types.GENERATION_STOPPED, onStopped);
      eventSource.on(event_types.GENERATION_ENDED, onEnded);
      disposers.push(() => eventSource.removeListener(event_types.GENERATION_STARTED, onStarted));
      disposers.push(() => eventSource.removeListener(event_types.GENERATION_STOPPED, onStopped));
      disposers.push(() => eventSource.removeListener(event_types.GENERATION_ENDED, onEnded));
    }

    if (observeTargets.has('streamTokens')) {
      eventSource.on(event_types.STREAM_TOKEN_RECEIVED, onStreamToken);
      disposers.push(() => eventSource.removeListener(event_types.STREAM_TOKEN_RECEIVED, onStreamToken));
    }
  }

  // ---------------------------------------------------------------------------
  // Observe (DOM): stop button visibility
  // ---------------------------------------------------------------------------
  if (observeTargets.has('stopButtonVisibility')) {
    const emitStopVisible = (visible: boolean, display?: string) => {
      const payload: HookStopButtonVisibilityPayload = {
        id: rt.id,
        timestamp: Date.now(),
        visible,
        display,
      };
      emitBoth(rt, visible ? 'ui.stopButtonShown' : 'ui.stopButtonHidden', payload);
    };

    const check = () => {
      const el = getStopButtonEl();
      const { visible, display } = computeStopVisible(el);
      if (rt.lastStopVisible === undefined) {
        rt.lastStopVisible = visible;
        if (rt.observe.emitInitialStopButtonState) {
          emitStopVisible(visible, display);
        }
        return;
      }
      if (visible !== rt.lastStopVisible) {
        rt.lastStopVisible = visible;
        emitStopVisible(visible, display);
      }
    };

    // Initial and ongoing observation
    check();
    const obs = new MutationObserver(() => check());
    const root = document.body ?? document.documentElement;
    obs.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    rt.stopObserver = obs;
    disposers.push(() => obs.disconnect());
  }

  rt.cleanup = () => {
    for (let i = disposers.length - 1; i >= 0; i--) {
      try {
        disposers[i]();
      } catch {
        // ignore
      }
    }
  };

  installs.set(id, rt);
  return { id, ok: true };
}

export async function uninstall(input: UninstallHooksInput): Promise<UninstallHooksOutput> {
  const id = String(input?.id || '').trim();
  if (!id) return { ok: false };
  const rt = installs.get(id);
  if (!rt) return { ok: false };
  rt.cleanup();
  installs.delete(id);
  return { ok: true };
}

export async function bypassOnce(input: BypassOnceInput): Promise<BypassOnceOutput> {
  const id = String(input?.id || '').trim();
  const target = (input?.target ?? 'any') as HookInterceptTarget | 'any';
  const rt = installs.get(id);
  if (!rt) return { ok: false };
  rt.bypassOnce.set(target, true);
  return { ok: true };
}

