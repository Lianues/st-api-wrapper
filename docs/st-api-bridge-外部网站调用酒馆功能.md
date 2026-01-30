## 外部网页桥接 ST_API（st-api-wrapper）能力

当你的应用部署在外部域名（例如 `workers.dev` / `pages.dev`）并在 SillyTavern 内部加载时，通常会遇到：

- 外部网页 **无法直接访问** `window.ST_API`
- 读取 `window.top` / `window.parent` 的 `ST_API` 会因为 **浏览器同源策略**失败

本篇文档给出一种推荐做法：在 **酒馆同源页面** 做一层“承载页（Host）”，用 `iframe` 加载外部网页，并通过 `postMessage` 代理把 `ST_API` 调用转发给外部网页，使外部网页“像在酒馆里一样”使用 `ST_API.xxx.yyy()`。

---

## 原理概述

- **外部网页（iframe 内）**：只能通过 `postMessage` 向父页面请求调用某个 `ST_API` endpoint
- **酒馆侧承载页（iframe 外）**：能直接访问 `window.ST_API`（因为它运行在酒馆环境/同源），收到请求后代调用并把结果回传

```text
外部网页(跨域) --postMessage--> 酒馆承载页(同源) --直接调用--> window.ST_API
外部网页(跨域) <--postMessage-- 酒馆承载页(同源) <--返回结果-- window.ST_API
```

---

## 酒馆侧：承载页（Host HTML）示例

把下面 HTML 放在**酒馆可访问的同源位置**（例如在酒馆的沙盒html里，需要提示用户自己替换，把我们的html注入到酒馆里，比如直接使用html显示，或者是用正则替换占位符为桥接html），然后在酒馆里使用它。

只需要修改两处：

- `APP_URL`：你的外部网页地址
- `ALLOWED_ST_ENDPOINTS`：你允许外部网页调用的 endpoint 白名单（强烈建议只放必要的）

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wenwan Bridge</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100vh; overflow: hidden; }
      iframe { width: 100%; height: 100vh; border: none; display: block; }
      .loading {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: Arial, sans-serif;
        color: #666;
        background: rgba(255,255,255,0.85);
        z-index: 1;
      }
    </style>
  </head>
  <body>
    <div class="loading" id="loading">正在加载…</div>

    <iframe
      id="appFrame"
      allowfullscreen
      referrerpolicy="no-referrer"
      allow="fullscreen; clipboard-read; clipboard-write"
    ></iframe>

    <script>
      // 1) 外部网页地址
      const APP_URL = "https://your-app.workers.dev/";
      const APP_ORIGIN = new URL(APP_URL).origin;

      // 2) 只允许必要的 endpoint（强烈建议白名单）
      const ALLOWED_ST_ENDPOINTS = new Set([
        "prompt.generate",
        "prompt.get",
        "prompt.buildRequest",
        "preset.get",
        "worldBook.list",
        "worldBook.get",
        "ui.listSettingsPanels",
      ]);

      const loading = document.getElementById("loading");
      const frame = document.getElementById("appFrame");

      frame.src = APP_URL;
      frame.addEventListener("load", () => {
        loading.style.display = "none";
      });

      function getSTAPI() {
        try { if (window.ST_API) return window.ST_API; } catch {}
        try { if (window.parent && window.parent !== window && window.parent.ST_API) return window.parent.ST_API; } catch {}
        try { if (window.top && window.top !== window && window.top.ST_API) return window.top.ST_API; } catch {}
        return null;
      }

      function reply(event, payload) {
        // sandbox iframe 时 event.origin 可能是 "null"
        const targetOrigin = (event.origin && event.origin !== "null") ? event.origin : "*";
        event.source.postMessage(payload, targetOrigin);
      }

      window.addEventListener("message", async (event) => {
        // 只接受来自 iframe 的消息
        if (event.source !== frame.contentWindow) return;

        // 严格校验来源（允许 sandbox 的 "null"）
        if (event.origin !== APP_ORIGIN && event.origin !== "null") return;

        const data = event.data;
        if (!data || typeof data !== "object") return;

        // 协议：{ type:'ST_API_CALL', id, endpoint:'prompt.generate', params:{} }
        if (data.type !== "ST_API_CALL") return;

        const id = data.id;
        const endpoint = String(data.endpoint || "");
        const params = data.params || {};

        if (!ALLOWED_ST_ENDPOINTS.has(endpoint)) {
          reply(event, { id, error: `Endpoint not allowed: ${endpoint}` });
          return;
        }

        const api = getSTAPI();
        if (!api) {
          reply(event, { id, error: "ST_API not available (enable st-api-wrapper)" });
          return;
        }

        const parts = endpoint.split(".");
        if (parts.length !== 2) {
          reply(event, { id, error: "Invalid endpoint format" });
          return;
        }

        const [ns, method] = parts;
        const fn = api?.[ns]?.[method];
        if (typeof fn !== "function") {
          reply(event, { id, error: `ST_API.${ns}.${method} is not available` });
          return;
        }

        try {
          const result = await fn(params);
          reply(event, { id, data: result });
        } catch (e) {
          reply(event, { id, error: (e && e.message) ? e.message : String(e) });
        }
      });
    </script>
  </body>
</html>
```

---

## 酒馆侧：承载页（Host HTML）示例（全量转发 / 不做白名单）

有时“对接网站”和“维护酒馆承载页”的人是同一个，并且外部网页也完全可控（不会给别人用），你可能更希望**省掉 endpoint 白名单**，让外部网页可以调用 `ST_API` 的全部 endpoint（例如 `command.*`、`file.*`、`serverPlugin.*` 等）。

> 风险提示：即使是你自己维护的网站，也可能被第三方脚本/依赖污染。一旦外部网页被注入恶意代码，就等于拿到了酒馆环境里 `ST_API` 的全部能力（包含潜在高危操作）。  
> 因此：此示例**只建议在完全自用、且你能承担风险**的情况下使用。

下面示例与上一个的差异点：

- **移除** `ALLOWED_ST_ENDPOINTS` 筛选
- 仍然保留 `event.source === iframe.contentWindow` 和 `origin` 校验（最低限度的隔离）

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Wenwan Bridge (FULL)</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100vh; overflow: hidden; }
      iframe { width: 100%; height: 100vh; border: none; display: block; }
      .loading {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: Arial, sans-serif;
        color: #666;
        background: rgba(255,255,255,0.85);
        z-index: 1;
      }
    </style>
  </head>
  <body>
    <div class="loading" id="loading">正在加载…</div>

    <iframe
      id="appFrame"
      allowfullscreen
      referrerpolicy="no-referrer"
      allow="fullscreen; clipboard-read; clipboard-write"
    ></iframe>

    <script>
      // 1) 外部网页地址
      const APP_URL = "https://your-app.workers.dev/";
      const APP_ORIGIN = new URL(APP_URL).origin;

      const loading = document.getElementById("loading");
      const frame = document.getElementById("appFrame");

      frame.src = APP_URL;
      frame.addEventListener("load", () => {
        loading.style.display = "none";
      });

      function getSTAPI() {
        try { if (window.ST_API) return window.ST_API; } catch {}
        try { if (window.parent && window.parent !== window && window.parent.ST_API) return window.parent.ST_API; } catch {}
        try { if (window.top && window.top !== window && window.top.ST_API) return window.top.ST_API; } catch {}
        return null;
      }

      function reply(event, payload) {
        // sandbox iframe 时 event.origin 可能是 "null"
        const targetOrigin = (event.origin && event.origin !== "null") ? event.origin : "*";
        event.source.postMessage(payload, targetOrigin);
      }

      window.addEventListener("message", async (event) => {
        // 只接受来自 iframe 的消息
        if (event.source !== frame.contentWindow) return;

        // 严格校验来源（允许 sandbox 的 "null"）
        if (event.origin !== APP_ORIGIN && event.origin !== "null") return;

        const data = event.data;
        if (!data || typeof data !== "object") return;

        // 协议：{ type:'ST_API_CALL', id, endpoint:'prompt.generate', params:{} }
        if (data.type !== "ST_API_CALL") return;

        const id = data.id;
        const endpoint = String(data.endpoint || "");
        const params = data.params || {};

        const api = getSTAPI();
        if (!api) {
          reply(event, { id, error: "ST_API not available (enable st-api-wrapper)" });
          return;
        }

        // endpoint 约定为 namespace.method
        const parts = endpoint.split(".");
        if (parts.length !== 2) {
          reply(event, { id, error: "Invalid endpoint format" });
          return;
        }

        const [ns, method] = parts;
        const fn = api?.[ns]?.[method];
        if (typeof fn !== "function") {
          reply(event, { id, error: `ST_API.${ns}.${method} is not available` });
          return;
        }

        try {
          const result = await fn(params);
          reply(event, { id, data: result });
        } catch (e) {
          reply(event, { id, error: (e && e.message) ? e.message : String(e) });
        }
      });
    </script>
  </body>
</html>
```

---

## 外部网页侧：创建一个 ST_API 代理对象（可选但推荐）

如果你希望在外部网页里能直接写：

```typescript
await ST_API.prompt.generate(...)
```

可以在外部网页初始化时注入一个“代理版 ST_API”，把方法调用转换成 `postMessage` 请求。

```typescript
type STApiCallRequest = {
  type: 'ST_API_CALL';
  id: string;
  endpoint: string;
  params?: unknown;
};

type STApiCallResponse<T = unknown> = {
  id: string;
  data?: T;
  error?: string;
};

export type STApiProxyOptions = {
  /**
   * 通常为 window.parent（你的页面被酒馆承载页 iframe 加载）
   */
  targetWindow?: Window;
  /**
   * 建议填承载页的 origin（例如 http://127.0.0.1:8000）
   * 不确定时可先用 "*"（不推荐长期使用）
   */
  targetOrigin?: string;
  /**
   * 可选：只接受来自该 origin 的回包（若 iframe sandbox 导致 origin 为 "null"，需兼容）
   */
  expectedOrigin?: string;
  timeoutMs?: number;
};

/**
 * 创建一个“代理版 ST_API”
 * - 任何 ST_API.xxx.yyy(params) 都会被转成 postMessage -> Host -> 调用 window.ST_API -> 回传结果
 */
export function createSTApiProxy(options: STApiProxyOptions = {}) {
  const targetWindow = options.targetWindow ?? window.parent;
  const targetOrigin = options.targetOrigin ?? '*';
  const expectedOrigin = options.expectedOrigin;
  const timeoutMs = options.timeoutMs ?? 120_000;

  async function call<T = unknown>(endpoint: string, params?: unknown): Promise<T> {
    const id = `st_api_${endpoint}_${Date.now()}_${Math.random()}`;
    const req: STApiCallRequest = { type: 'ST_API_CALL', id, endpoint, params };

    return await new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        window.removeEventListener('message', onMessage);
        reject(new Error(`ST_API_CALL timeout: ${endpoint}`));
      }, timeoutMs);

      function onMessage(event: MessageEvent) {
        if (expectedOrigin && event.origin !== expectedOrigin && event.origin !== 'null') return;
        const data = event.data as STApiCallResponse<T> | undefined;
        if (!data || data.id !== id) return;

        window.clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        if (data.error) reject(new Error(data.error));
        else resolve(data.data as T);
      }

      window.addEventListener('message', onMessage);
      targetWindow.postMessage(req, targetOrigin);
    });
  }

  // 用 Proxy 把 ST_API.prompt.generate 这种链式访问转换成 endpoint 字符串
  return new Proxy(
    {},
    {
      get(_t, ns) {
        return new Proxy(
          {},
          {
            get(_t2, method) {
              return (params?: unknown) => call(`${String(ns)}.${String(method)}`, params ?? {});
            }
          }
        );
      }
    }
  ) as any;
}

// 可选：为 window.ST_API 声明类型（避免 TS 报错）
declare global {
  interface Window {
    ST_API?: any;
  }
}

// 在外部网页挂载（注意：这只是代理对象，不是真正的 window.ST_API）
window.ST_API = createSTApiProxy();
```

---

## 示例：在外部网页调用 `prompt.generate`

> 注意：`writeToChat=true` 时不允许 `chatHistory.replace/inject`；外部网页通常应该用 `writeToChat=false` 后台生成。

```typescript
type STChatRole = 'system' | 'user' | 'model';

type STMessagePart = { text: string };

type STChatMessage = {
  role: STChatRole;
  parts: STMessagePart[];
};

type STPromptGenerateInput = {
  writeToChat?: boolean;
  timeoutMs?: number;
  chatHistory?: {
    replace?: STChatMessage[];
    // inject 省略（如需可按 buildRequest 文档补齐 depth/order/message）
  };
};

type STPromptGenerateOutput = {
  timestamp: number;
  characterId?: number;
  text: string;
  from: 'inChat' | 'background';
};

interface STApiProxySubset {
  prompt: {
    generate(input: STPromptGenerateInput): Promise<STPromptGenerateOutput>;
  };
}

(async () => {
  // 这里的 ST_API 是你注入的代理对象（见上一节）
  const ST_API = window.ST_API as unknown as STApiProxySubset;

  const res = await ST_API.prompt.generate({
    writeToChat: false,
    timeoutMs: 120000,
    chatHistory: {
      replace: [
        { role: 'system', parts: [{ text: '你是一个有用的助手。' }] },
        { role: 'user', parts: [{ text: '你好，简单自我介绍一下' }] },
      ],
    },
  });

  console.log('生成结果:', res.text);
})();
```

---

## 安全建议（强烈建议遵守）

- **只允许白名单 endpoint**：不要把 `command.run`、`file.*` 等高危能力暴露给外部网页
- **校验来源 origin**：只接受来自你的 `APP_ORIGIN` 的消息（如使用 `sandbox`，需兼容 `origin === 'null'`）
- **只接受来自指定 iframe 的 event.source**：避免其它页面伪造消息
- **尽量避免给 iframe 过宽的权限**：例如不需要就不要开启 `allow-popups`、不要注入不可信脚本

