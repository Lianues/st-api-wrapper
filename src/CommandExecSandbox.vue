<template>
  <div class="st-api-wrapper-panel">
    <div class="actions flex-container">
      <button class="menu_button" type="button" @click="reload" :disabled="loading || saving || togglingEnabled">
        刷新
      </button>
      <button class="menu_button" type="button" @click="applyDefaults" :disabled="loading || saving || togglingEnabled || !defaults">
        重置为默认
      </button>
      <button class="menu_button" type="button" @click="save" :disabled="loading || saving || togglingEnabled || !draft">
        保存
      </button>
    </div>

    <div class="master-toggle" v-if="draft">
      <label class="field checkbox">
        <input type="checkbox" :checked="draft.enabled" @change="onEnabledToggle" :disabled="loading || saving || togglingEnabled" />
        <span><b>启用后端命令权限配置（总开关）</b></span>
      </label>
      <div class="hint muted">
        开启：按下方规则限制命令执行；关闭：恢复全权限（高风险）。
      </div>
    </div>

    <div class="status">
      <div v-if="filePath">配置文件：<code>{{ filePath }}</code> <span v-if="fileExists === false" class="muted">（未创建）</span></div>
      <div v-if="fileError" class="warn">读取配置失败：{{ fileError }}（已使用默认值）</div>
      <div v-if="loading" class="muted">正在加载...</div>
      <div v-if="togglingEnabled" class="warn">正在应用总开关...</div>
      <div v-if="saving" class="warn">正在保存...</div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <details class="details" open v-if="draft">
      <summary>权限规则与开关</summary>
      <div class="form">
        <div class="row">
          <label class="field checkbox">
            <input type="checkbox" v-model="draft.allowDirect" />
            <span>允许 direct（allowDirect）</span>
          </label>
          <label class="field checkbox">
            <input type="checkbox" v-model="draft.allowScript" />
            <span class="danger-text">允许 script（allowScript，高风险）</span>
          </label>
          <label class="field checkbox">
            <input type="checkbox" v-model="draft.denyShellCommands" />
            <span>禁止 shell 命令（denyShellCommands）</span>
          </label>
        </div>

        <div class="row">
          <label class="field checkbox">
            <input type="checkbox" v-model="draft.allowTerminalOverrides" />
            <span class="danger-text">允许 terminal 覆盖（allowTerminalOverrides，高风险）</span>
          </label>
          <label class="field checkbox">
            <input type="checkbox" v-model="draft.allowEnvOverride" />
            <span class="danger-text">允许 env 覆盖（allowEnvOverride，高风险）</span>
          </label>
        </div>

        <label class="field">
          <div class="label">direct 命令过滤模式（commandListMode）</div>
          <select class="text" v-model="draft.commandListMode">
            <option value="allowlist">白名单 allowlist（更安全：allowedCommands 为空=全部拒绝）</option>
            <option value="denylist">黑名单 denylist（更危险：默认放行，blockedCommands 中的命令会被拒绝）</option>
          </select>
        </label>

        <label class="field">
          <div class="label">maxTimeoutMs（启用权限配置时作为默认超时 + 上限）</div>
          <input class="text" type="number" min="0" step="1000" v-model.number="draft.maxTimeoutMs" />
        </label>

        <div class="hint muted">
          <template v-if="draft.commandListMode === 'denylist'">
            提示：黑名单模式下，除了匹配 <code>blockedCommands</code> 的命令外，其余命令会被放行（仍受 <code>denyShellCommands</code> 与目录限制影响）。
          </template>
          <template v-else>
            提示：白名单模式下 <code>allowedCommands=[]</code> 表示 deny-all，所以 <code>run</code> 会被 403 拒绝，直到你添加白名单。
          </template>
        </div>
      </div>
    </details>

    <details class="details" open v-if="draft && draft.commandListMode !== 'denylist'">
      <summary>allowedCommands（白名单模式：direct 命令允许列表）</summary>
      <div class="form">
        <div class="hint muted">
          允许执行的 <b>direct</b> 命令。可填命令名（如 <code>python</code>）或完整路径（如 <code>C:\\Python\\python.exe</code>）。留空=全部拒绝。
        </div>

        <div class="list">
          <div class="list-row" v-for="(c, idx) in draft.allowedCommands" :key="idx">
            <input class="text" v-model="draft.allowedCommands[idx]" placeholder="python / C:\\Python\\python.exe" />
            <button class="menu_button danger" type="button" @click="removeAt(draft.allowedCommands, idx)" :disabled="saving">
              删除
            </button>
          </div>
        </div>

        <button class="menu_button" type="button" @click="addOne(draft.allowedCommands)" :disabled="saving">
          添加命令
        </button>
      </div>
    </details>

    <details class="details" open v-if="draft && draft.commandListMode === 'denylist'">
      <summary>blockedCommands（黑名单模式：direct 命令拒绝列表）</summary>
      <div class="form">
        <div class="hint muted">
          匹配到该列表的 <b>direct</b> 命令会被拒绝（403）。默认会预置一些高危命令；你可以按需删改。
        </div>

        <div class="list">
          <div class="list-row" v-for="(c, idx) in draft.blockedCommands" :key="idx">
            <input class="text" v-model="draft.blockedCommands[idx]" placeholder="cmd / powershell / rm / ..." />
            <button class="menu_button danger" type="button" @click="removeAt(draft.blockedCommands, idx)" :disabled="saving">
              删除
            </button>
          </div>
        </div>

        <button class="menu_button" type="button" @click="addOne(draft.blockedCommands)" :disabled="saving">
          添加命令
        </button>
      </div>
    </details>

    <details class="details" open v-if="draft">
      <summary>allowedCwdRoots（允许的工作目录根路径）</summary>
      <div class="form">
        <div class="hint muted">
          <code>cwd</code> 必须位于任一 root 内（否则 403）。空数组表示不限制（不推荐）。
        </div>

        <div class="list">
          <div class="list-row" v-for="(p, idx) in draft.allowedCwdRoots" :key="idx">
            <input class="text" v-model="draft.allowedCwdRoots[idx]" placeholder="F:\\111\\project 或 /home/user/project" />
            <button class="menu_button danger" type="button" @click="removeAt(draft.allowedCwdRoots, idx)" :disabled="saving">
              删除
            </button>
          </div>
        </div>

        <button class="menu_button" type="button" @click="addOne(draft.allowedCwdRoots)" :disabled="saving">
          添加目录
        </button>
      </div>
    </details>

    <details class="details" open v-if="draft">
      <summary>allowedEnvKeys（允许覆盖的 env key，可选）</summary>
      <div class="form">
        <div class="hint muted">
          仅在 <code>allowEnvOverride=true</code> 时生效。留空表示允许任意 key（依然高风险）。
        </div>

        <div class="list">
          <div class="list-row" v-for="(k, idx) in draft.allowedEnvKeys" :key="idx">
            <input class="text" v-model="draft.allowedEnvKeys[idx]" placeholder="PATH / PYTHONPATH / ..." />
            <button class="menu_button danger" type="button" @click="removeAt(draft.allowedEnvKeys, idx)" :disabled="saving">
              删除
            </button>
          </div>
        </div>

        <button class="menu_button" type="button" @click="addOne(draft.allowedEnvKeys)" :disabled="saving">
          添加 key
        </button>
      </div>
    </details>

    <details class="details" v-if="draft">
      <summary>风险说明（建议先读）</summary>
      <ul class="tips">
        <li><b>allowScript</b>：允许执行任意 shell 脚本，风险很高。</li>
        <li><b>commandListMode=denylist</b>：黑名单模式是“默认放行”，只拦截黑名单；比白名单更危险。</li>
        <li><b>denyShellCommands=false</b>：允许 direct 运行 <code>cmd/powershell/bash</code> 等，基本等价于“可执行任意命令”。</li>
        <li><b>enabled=false</b>：关闭命令权限配置，恢复全权限（最危险）。</li>
      </ul>
    </details>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type {
  CommandSandboxConfig,
  CommandSandboxGetOutput,
  CommandSandboxSetInput,
} from './apis/command/types';

type CommandApi = {
  probe: (input?: any) => Promise<any>;
  getSandbox: () => Promise<CommandSandboxGetOutput>;
  setSandbox: (input: CommandSandboxSetInput) => Promise<CommandSandboxGetOutput>;
};

type STApi = {
  command: CommandApi;
};

function getApi(): STApi {
  const api = window.ST_API as STApi | undefined;
  if (!api) throw new Error('ST_API 未就绪');
  if (!api.command) throw new Error('command API 未注册（请确认已更新并启用 st-api-wrapper）');
  return api;
}

function cloneConfig(c: CommandSandboxConfig): CommandSandboxConfig {
  return {
    ...c,
    commandListMode: (c as any).commandListMode === 'denylist' ? 'denylist' : 'allowlist',
    allowedCommands: [...(c.allowedCommands ?? [])],
    blockedCommands: [...((c as any).blockedCommands ?? [])],
    allowedCwdRoots: [...(c.allowedCwdRoots ?? [])],
    allowedEnvKeys: [...(c.allowedEnvKeys ?? [])],
  };
}

const loading = ref(false);
const saving = ref(false);
const togglingEnabled = ref(false);
const error = ref<string | null>(null);

const filePath = ref<string>('');
const fileExists = ref<boolean | null>(null);
const fileError = ref<string | null>(null);

const defaults = ref<CommandSandboxConfig | null>(null);
const original = ref<CommandSandboxConfig | null>(null);
const draft = ref<CommandSandboxConfig | null>(null);

async function reload() {
  loading.value = true;
  error.value = null;
  fileError.value = null;
  try {
    const api = getApi();
    // probe is optional; mainly to make sure backend is alive
    await api.command.probe().catch(() => {});
    const r = await api.command.getSandbox();
    filePath.value = r.file?.path ?? '';
    fileExists.value = typeof r.file?.exists === 'boolean' ? r.file.exists : null;
    fileError.value = r.file?.error ?? null;
    defaults.value = cloneConfig(r.defaults);
    original.value = cloneConfig(r.config);
    draft.value = cloneConfig(r.config);
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}

function addOne(list: string[]) {
  list.push('');
}

function removeAt(list: string[], idx: number) {
  list.splice(idx, 1);
}

function applyDefaults() {
  if (!defaults.value) return;
  draft.value = cloneConfig(defaults.value);
  toastr.info('已重置为默认（未保存）');
}

function onEnabledToggle(e: Event) {
  const input = e.target as HTMLInputElement | null;
  if (!input || !draft.value) return;
  const nextEnabled = !!input.checked;

  // Closing permission restrictions => full access (dangerous)
  if (!nextEnabled) {
    const ok = confirm('关闭后端命令权限配置后，将恢复后端命令执行的全权限（高风险）。确认关闭？');
    if (!ok) {
      input.checked = draft.value.enabled;
      return;
    }
  }

  void setPermissionEnabled(nextEnabled);
}

async function setPermissionEnabled(nextEnabled: boolean) {
  if (!draft.value) return;

  togglingEnabled.value = true;
  error.value = null;

  try {
    const api = getApi();
    const r = await api.command.setSandbox({ enabled: nextEnabled });
    filePath.value = r.file?.path ?? filePath.value;
    fileExists.value = typeof r.file?.exists === 'boolean' ? r.file.exists : fileExists.value;
    fileError.value = r.file?.error ?? null;

    defaults.value = cloneConfig(r.defaults);
    original.value = cloneConfig(r.config);
    // keep other draft edits; only sync enabled
    if (draft.value) draft.value.enabled = r.config.enabled;

    toastr.success(nextEnabled ? '已启用后端命令权限配置' : '已关闭后端命令权限配置（已恢复全权限）');
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    togglingEnabled.value = false;
  }
}

async function save() {
  if (!draft.value) return;
  saving.value = true;
  error.value = null;

  try {
    const next = cloneConfig(draft.value);
    const prev = original.value;

    const dangerous: string[] = [];
    const prevEnabled = prev?.enabled ?? true;
    const prevAllowScript = prev?.allowScript ?? false;
    const prevAllowTerminalOverrides = prev?.allowTerminalOverrides ?? false;
    const prevAllowEnvOverride = prev?.allowEnvOverride ?? false;
    const prevDenyShellCommands = prev?.denyShellCommands ?? true;
    const prevCommandListMode = (prev as any)?.commandListMode === 'denylist' ? 'denylist' : 'allowlist';

    if (prevEnabled && !next.enabled) dangerous.push('关闭后端命令权限配置（enabled=false，恢复全权限）');
    if (!prevAllowScript && next.allowScript) dangerous.push('开启 script 模式（allowScript=true）');
    if (!prevAllowTerminalOverrides && next.allowTerminalOverrides) dangerous.push('允许 terminal 覆盖（allowTerminalOverrides=true）');
    if (!prevAllowEnvOverride && next.allowEnvOverride) dangerous.push('允许 env 覆盖（allowEnvOverride=true）');
    if (prevDenyShellCommands && !next.denyShellCommands) dangerous.push('允许 direct 运行 shell（denyShellCommands=false）');
    if (prevCommandListMode !== 'denylist' && next.commandListMode === 'denylist') {
      dangerous.push('切换到黑名单模式（denylist：默认放行除黑名单外的命令）');
    }
    if (next.commandListMode === 'denylist') {
      const effectiveBlocked = (next.blockedCommands ?? []).map(s => (s ?? '').trim()).filter(Boolean);
      if (effectiveBlocked.length === 0) {
        dangerous.push('黑名单为空（denylist + 空列表 将放行几乎所有 direct 命令）');
      }
    }

    if (dangerous.length > 0) {
      const ok = confirm(
        `你正在开启高风险权限：\n- ${dangerous.join('\n- ')}\n\n这会显著提升后端执行风险。确认继续保存？`,
      );
      if (!ok) return;
    }

    const api = getApi();
    const r = await api.command.setSandbox(next);
    filePath.value = r.file?.path ?? filePath.value;
    fileExists.value = typeof r.file?.exists === 'boolean' ? r.file.exists : fileExists.value;
    fileError.value = r.file?.error ?? null;
    defaults.value = cloneConfig(r.defaults);
    original.value = cloneConfig(r.config);
    draft.value = cloneConfig(r.config);
    toastr.success('权限配置已保存');
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  reload();
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

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 260px;
}

.field.checkbox {
  flex-direction: row;
  align-items: center;
  min-width: unset;
}

.label {
  font-size: 0.9em;
  opacity: 0.85;
}

.text {
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--SmartThemeBorderColor);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.hint {
  opacity: 0.9;
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

.danger-text {
  color: #ff6b81;
}

.tips {
  margin: 10px 0 0;
  padding-left: 18px;
  opacity: 0.95;
}
</style>

