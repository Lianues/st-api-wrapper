<template>
  <div class="st-api-wrapper-panel">
    <div class="actions flex-container">
      <button class="menu_button" type="button" @click="refreshList" :disabled="loading">
        刷新列表
      </button>
      <button class="menu_button" type="button" @click="manualRestart" :disabled="loading || restarting">
        重启酒馆（后端）
      </button>
    </div>

    <div class="status">
      <div v-if="pluginsRoot">plugins 目录：<code>{{ pluginsRoot }}</code></div>
      <div>已发现插件：{{ plugins.length }}</div>
      <div v-if="restarting" class="warn">正在重启中：{{ restartMessage }}</div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <details class="details" open>
      <summary>安装 Server Plugin</summary>
      <div class="form">
        <div class="row">
          <label class="field">
            <div class="label">安装方式</div>
            <select class="text" v-model="installMethod">
              <option value="git">Git</option>
              <option value="zip">ZIP</option>
            </select>
          </label>
          <label class="field">
            <div class="label">restartMode</div>
            <select class="text" v-model="restartMode">
              <option value="respawn">respawn（推荐）</option>
              <option value="exit">exit（仅退出）</option>
            </select>
          </label>
          <label class="field checkbox">
            <input type="checkbox" v-model="restartAfterOp" />
            <span>操作完成后自动重启</span>
          </label>
        </div>

        <template v-if="installMethod === 'git'">
          <label class="field">
            <div class="label">gitUrl</div>
            <input class="text" v-model="gitUrl" placeholder="https://github.com/xxx/yyy.git" />
          </label>
          <div class="row">
            <label class="field">
              <div class="label">folderName（可选）</div>
              <input class="text" v-model="folderName" placeholder="不填则从 URL 推断" />
            </label>
            <label class="field">
              <div class="label">branch（可选）</div>
              <input class="text" v-model="branch" placeholder="main / master / ..." />
            </label>
          </div>
        </template>

        <template v-else>
          <label class="field">
            <div class="label">上传 ZIP 文件</div>
            <div class="file-row">
              <input
                ref="zipInputEl"
                class="hidden-file-input"
                type="file"
                accept=".zip,application/zip"
                @change="onZipChange"
              />
              <button class="menu_button" type="button" @click="chooseZip" :disabled="loading || restarting">
                上传 ZIP 文件
              </button>
              <span class="file-name" :class="{ muted: !zipFile }">
                {{ zipFile ? zipFile.name : '未选择文件' }}
              </span>
              <button v-if="zipFile" class="menu_button" type="button" @click="clearZip" :disabled="loading || restarting">
                清除
              </button>
            </div>
          </label>
          <label class="field">
            <div class="label">folderName（可选）</div>
            <input class="text" v-model="zipFolderName" placeholder="不填则从 zip 文件名推断" />
          </label>
        </template>

        <div class="actions flex-container">
          <button
            class="menu_button"
            type="button"
            @click="installSelected"
            :disabled="loading || restarting || (installMethod === 'git' ? !gitUrl.trim() : !zipFile)"
          >
            安装
          </button>
        </div>
      </div>
    </details>

    <details class="details" open>
      <summary>已安装插件</summary>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>name</th>
              <th>kind</th>
              <th>info</th>
              <th>entry</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in plugins" :key="p.name">
              <td><code>{{ p.name }}</code></td>
              <td>{{ p.kind }}</td>
              <td>
                <div v-if="p.info">
                  <div><b>{{ p.info.name }}</b> <small>({{ p.info.id }})</small></div>
                  <div class="muted">{{ p.info.description }}</div>
                </div>
                <div v-else class="muted">
                  <span v-if="p.infoError">infoError: {{ p.infoError }}</span>
                  <span v-else>（无 info）</span>
                </div>
              </td>
              <td class="muted">
                <div v-if="p.entryMissing" class="error">entryMissing</div>
                <div v-if="p.entryFile"><code>{{ p.entryFile }}</code></div>
              </td>
              <td>
                <button class="menu_button" type="button" @click="loadDetail(p.name)" :disabled="loading">
                  获取
                </button>
                <button class="menu_button danger" type="button" @click="deleteOne(p.name)" :disabled="loading || restarting">
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="plugins.length === 0">
              <td colspan="5" class="muted">暂无插件</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

    <details class="details" v-if="detail">
      <summary>当前详情：{{ detail.name }}</summary>
      <pre class="json">{{ JSON.stringify(detail, null, 2) }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type {
  RestartMode,
  ServerPluginGetOutput,
  ServerPluginListItem,
} from './apis/serverPlugin/types';

type ServerPluginApi = {
  list: (input?: { includeInfo?: boolean }) => Promise<{ ok: boolean; pluginsRoot: string; plugins: ServerPluginListItem[] }>;
  get: (input: { name: string; includeInfo?: boolean }) => Promise<ServerPluginGetOutput>;
  add: (input: any) => Promise<any>;
  addZip: (input: any) => Promise<any>;
  delete: (input: any) => Promise<any>;
  restart: (input?: any) => Promise<any>;
};

type STApi = {
  serverPlugin: ServerPluginApi;
};

function getApi(): STApi {
  const api = window.ST_API as STApi | undefined;
  if (!api) throw new Error('ST_API 未就绪');
  if (!api.serverPlugin) throw new Error('serverPlugin API 未注册（请确认已更新并启用 st-api-wrapper）');
  return api;
}

const loading = ref(false);
const restarting = ref(false);
const restartMessage = ref('');
const error = ref<string | null>(null);

const pluginsRoot = ref('');
const plugins = ref<ServerPluginListItem[]>([]);
const detail = ref<any | null>(null);

type InstallMethod = 'git' | 'zip';
const installMethod = ref<InstallMethod>('git');

const gitUrl = ref('');
const folderName = ref('');
const branch = ref('');
const restartMode = ref<RestartMode>('respawn');
const restartAfterOp = ref(true);

const zipInputEl = ref<HTMLInputElement | null>(null);
const zipFile = ref<File | null>(null);
const zipFolderName = ref('');

async function refreshList() {
  loading.value = true;
  error.value = null;
  try {
    const api = getApi();
    const r = await api.serverPlugin.list({ includeInfo: true });
    pluginsRoot.value = r.pluginsRoot;
    plugins.value = r.plugins ?? [];
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

async function loadDetail(name: string) {
  loading.value = true;
  error.value = null;
  try {
    const api = getApi();
    const r = await api.serverPlugin.get({ name, includeInfo: true });
    detail.value = r;
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

async function installPlugin() {
  loading.value = true;
  error.value = null;
  detail.value = null;
  try {
    const api = getApi();
    const r = await api.serverPlugin.add({
      gitUrl: gitUrl.value,
      ...(folderName.value.trim() ? { folderName: folderName.value.trim() } : {}),
      ...(branch.value.trim() ? { branch: branch.value.trim() } : {}),
      restart: restartAfterOp.value,
      restartMode: restartMode.value,
      restartDelayMs: 800,
    });

    console.log('[ST API Wrapper] serverPlugin.add:', r);
    toastr.success('安装命令已提交');
    if (r?.restart?.scheduled) {
      beginRestartFlow(`已请求重启（${r.restart.mode}，约 ${r.restart.delayMs}ms）`);
    } else {
      await refreshList();
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

async function installSelected() {
  if (installMethod.value === 'git') {
    await installPlugin();
    return;
  }
  await installZip();
}

function chooseZip() {
  zipInputEl.value?.click();
}

function clearZip() {
  zipFile.value = null;
  if (zipInputEl.value) {
    // allow selecting the same file again
    zipInputEl.value.value = '';
  }
}

function onZipChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  zipFile.value = file;
  if (file && !zipFolderName.value.trim()) {
    const name = file.name.toLowerCase().endsWith('.zip') ? file.name.slice(0, -4) : file.name;
    zipFolderName.value = name;
  }
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  });
}

async function installZip() {
  if (!zipFile.value) return;
  loading.value = true;
  error.value = null;
  detail.value = null;
  try {
    const api = getApi();
    const zipBase64 = await readFileAsDataUrl(zipFile.value);
    const r = await api.serverPlugin.addZip({
      zipBase64,
      fileName: zipFile.value.name,
      ...(zipFolderName.value.trim() ? { folderName: zipFolderName.value.trim() } : {}),
      restart: restartAfterOp.value,
      restartMode: restartMode.value,
      restartDelayMs: 800,
    });
    console.log('[ST API Wrapper] serverPlugin.addZip:', r);
    toastr.success('ZIP 安装已提交');
    if (r?.restart?.scheduled) {
      beginRestartFlow(`已请求重启（${r.restart.mode}，约 ${r.restart.delayMs}ms）`);
    } else {
      await refreshList();
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

async function deleteOne(name: string) {
  if (!confirm(`确认删除后端插件：${name}？\n\n注意：删除后会重启酒馆（如果勾选了自动重启）。`)) return;
  loading.value = true;
  error.value = null;
  detail.value = null;
  try {
    const api = getApi();
    const r = await api.serverPlugin.delete({
      name,
      restart: restartAfterOp.value,
      restartMode: restartMode.value,
      restartDelayMs: 800,
    });
    console.log('[ST API Wrapper] serverPlugin.delete:', r);
    toastr.success('删除命令已提交');
    if (r?.restart?.scheduled) {
      beginRestartFlow(`已请求重启（${r.restart.mode}，约 ${r.restart.delayMs}ms）`);
    } else {
      await refreshList();
    }
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

async function manualRestart() {
  if (!confirm('确认重启酒馆后端？')) return;
  loading.value = true;
  error.value = null;
  try {
    const api = getApi();
    const r = await api.serverPlugin.restart({ mode: restartMode.value, delayMs: 800 });
    console.log('[ST API Wrapper] serverPlugin.restart:', r);
    toastr.warning('已请求重启');
    beginRestartFlow(`已请求重启（${r.restart.mode}，约 ${r.restart.delayMs}ms）`);
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

function beginRestartFlow(msg: string) {
  restarting.value = true;
  restartMessage.value = msg;

  // 尽力等待服务恢复后自动刷新页面
  const ctx = (window as any).SillyTavern?.getContext?.();
  const headers = (() => {
    const base: Record<string, string> = {};
    if (ctx?.getRequestHeaders) Object.assign(base, ctx.getRequestHeaders());
    base['Content-Type'] = 'application/json';
    return base;
  })();

  const startedAt = Date.now();
  const timeoutMs = 60_000;

  const tick = async () => {
    const elapsed = Date.now() - startedAt;
    if (elapsed > timeoutMs) {
      restarting.value = false;
      restartMessage.value = '重启超时：请手动刷新页面或手动重启酒馆';
      return;
    }

    try {
      const r = await fetch('/api/ping', { method: 'POST', headers, body: '{}' });
      if (r.ok || r.status === 204) {
        restartMessage.value = '服务已恢复，正在刷新页面...';
        setTimeout(() => window.location.reload(), 500);
        return;
      }
    } catch {
      // ignore
    }

    restartMessage.value = `等待服务恢复...（${Math.ceil((timeoutMs - elapsed) / 1000)}s）`;
    setTimeout(tick, 1000);
  };

  // 给后端一点时间先退出/重启
  setTimeout(tick, 1500);
}

onMounted(() => {
  refreshList();
});
</script>

<style scoped>
.st-api-wrapper-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu_button {
  white-space: nowrap;
  word-break: keep-all;
  writing-mode: horizontal-tb;
}

.actions {
  gap: 8px;
  flex-wrap: wrap;
}

.status {
  opacity: 0.95;
}

.details {
  border-top: 1px solid var(--SmartThemeBorderColor);
  padding-top: 10px;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hidden-file-input {
  display: none;
}

.file-name {
  font-family: monospace;
  opacity: 0.9;
  word-break: break-all;
}

.warn {
  margin-top: 6px;
  color: #ffa502;
}

.error {
  margin-top: 6px;
  color: #ff6b81;
}

.muted {
  opacity: 0.75;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 260px;
  flex: 1;
}

.field.checkbox {
  min-width: 220px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 0.9em;
  opacity: 0.85;
}

.text {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--SmartThemeBorderColor);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
}

.table-wrap {
  overflow: auto;
  margin-top: 8px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid var(--SmartThemeBorderColor);
  vertical-align: top;
}

.danger {
  background: rgba(255, 0, 0, 0.08);
}

.json {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid var(--SmartThemeBorderColor);
  background: rgba(255, 255, 255, 0.04);
}
</style>

