<template>
  <div class="st-api-wrapper-panel">
    <div class="actions flex-container">
      <button class="menu_button" type="button" @click="printEndpoints">打印 endpoints（控制台）</button>
      <button class="menu_button" type="button" @click="fetchPrompt">抓取最终提示词（控制台）</button>
    </div>

    <div class="status">
      <div>已注册 endpoints：{{ endpoints.length }}</div>
      <div v-if="lastPrompt">上次抓取 messages 数：{{ lastPrompt.messages.length }}</div>
      <div v-if="loading">正在构建提示词...</div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <details class="details" v-if="lastPrompt">
      <summary>预览 messages（前 5 条）</summary>
      <div class="messages-list">
        <div v-for="(msg, idx) in previewMessages" :key="idx" :class="['message-item', msg.role]">
          <span class="role-tag">{{ msg.role.toUpperCase() }}</span>
          <pre>{{ msg.content }}</pre>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PromptResult } from './types';

type PromptApi = {
  getFinalChatPrompt: (input: { timeoutMs?: number; forceCharacterId?: number }) => Promise<PromptResult>;
};

type STApi = {
  listEndpoints: () => string[];
  prompt: PromptApi;
};

const endpoints = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const lastPrompt = ref<PromptResult | null>(null);

const previewMessages = computed(() => lastPrompt.value?.messages.slice(0, 5) ?? []);

function getApi(): STApi {
  const api = window.ST_API as STApi | undefined;
  if (!api) throw new Error('ST_API 未就绪');
  return api;
}

function printEndpoints() {
  try {
    const api = getApi();
    endpoints.value = api.listEndpoints();
    console.log('[ST API Wrapper] endpoints:', endpoints.value);
    toastr.info(`已打印 endpoints（共 ${endpoints.value.length} 个）到控制台`);
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  }
}

async function fetchPrompt() {
  loading.value = true;
  error.value = null;

  try {
    const api = getApi();
    lastPrompt.value = await api.prompt.getFinalChatPrompt({ timeoutMs: 8000 });
    console.log('[ST API Wrapper] Final chat prompt:', lastPrompt.value);
    console.log('[ST API Wrapper] Final chat prompt messages:', lastPrompt.value.messages);
    toastr.success(`抓取成功：messages=${lastPrompt.value.messages.length}（已输出到控制台）`);
  } catch (e: any) {
    error.value = e?.message ?? String(e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.st-api-wrapper-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.message-item {
  padding: 8px;
  border-radius: 6px;
  border-left: 4px solid #444;
  background: rgba(255,255,255,0.05);
}

.message-item.system { border-color: #ff4757; }
.message-item.user { border-color: #2ed573; }
.message-item.assistant { border-color: #1e90ff; }

.role-tag {
  font-size: 0.8em;
  font-weight: bold;
  opacity: 0.7;
  display: block;
  margin-bottom: 5px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: monospace;
}

.error {
  margin-top: 6px;
  color: #ff6b81;
}
</style>
