import type {
  CharacterCard,
  DeleteCharacterInput,
  DeleteCharacterOutput,
  GetCharacterInput,
  GetCharacterOutput,
  ListCharactersInput,
  ListCharactersOutput,
  UpdateCharacterInput,
  UpdateCharacterOutput,
} from './types';
import { fromStRegex } from '../regexScript/utils';
import { fromStBook } from '../worldBook/impl';

/**
 * 获取 SillyTavern 的上下文
 */
function getSTContext() {
  return (window as any).SillyTavern?.getContext?.();
}

async function readErrorBody(resp: Response): Promise<string> {
  try {
    const text = await resp.text();
    return text ? ` ${text}` : '';
  } catch {
    return '';
  }
}

type ResponseMode = 'json' | 'text' | 'void';

async function postJson<T>(url: string, body: unknown, mode: ResponseMode = 'json'): Promise<T> {
  const ctx = getSTContext();
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(ctx?.getRequestHeaders?.() ?? {}) },
    body: JSON.stringify(body ?? {}),
  });

  if (!resp.ok) {
    const extra = await readErrorBody(resp);
    throw new Error(`Request failed: POST ${url} -> ${resp.status} ${resp.statusText}${extra}`);
  }

  // 注意：部分酒馆 endpoint 会使用 sendStatus(200)，响应 body 为纯文本 "OK"，
  // 因此这里按 mode 进行解析，避免强行 JSON.parse 导致报错。
  const text = await resp.text();
  if (mode === 'void') return undefined as T;
  if (mode === 'text') return text as unknown as T;

  if (!text) {
    throw new Error(`Request failed: expected JSON but got empty body. POST ${url}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Request failed: expected JSON but got non-JSON response. POST ${url}`);
  }
}

function getAvatarFromAny(raw: any): string | null {
  const v = raw?.avatar ?? raw?.avatar_url ?? raw?.avatarUrl;
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function avatarUrlFromName(name: string): string {
  const n = String(name ?? '').trim();
  if (!n) throw new Error('name is required');
  return `${n}.png`;
}

function stripPngSuffix(nameOrAvatar: string): string {
  const v = String(nameOrAvatar ?? '').trim();
  if (!v) return v;
  return v.toLowerCase().endsWith('.png') ? v.slice(0, -4) : v;
}

function safeObject(x: any): Record<string, any> {
  return x && typeof x === 'object' && !Array.isArray(x) ? x : {};
}

function cloneJson<T>(x: T): T {
  try {
    return JSON.parse(JSON.stringify(x)) as T;
  } catch {
    return x;
  }
}

function toCharacterCard(raw: any): CharacterCard {
  const data = safeObject(raw?.data);
  const rawName = (data?.name ?? raw?.name);
  const rawDesc = (data?.description ?? raw?.description);
  const avatar = getAvatarFromAny(raw) ?? '';
  const chatDate = typeof (raw as any)?.chat === 'string' ? (raw as any).chat : '';
  const createDate = typeof (raw as any)?.create_date === 'string' ? (raw as any).create_date : '';

  const altGreetingsRaw = (data as any)?.alternate_greetings;
  const alternateGreetings = Array.isArray(altGreetingsRaw) ? altGreetingsRaw.map((x: any) => String(x ?? '')) : [];
  const firstMes = (data as any)?.first_mes;

  // 仅当 first_mes 或 alternate_greetings 存在时才输出 message，避免 shallow 列表出现 [""]。
  const message: string[] = [];
  if (firstMes !== undefined || alternateGreetings.length > 0) {
    message.push(String(firstMes ?? ''));
    message.push(...alternateGreetings);
  }

  const ext = safeObject(data?.extensions);
  const rawRegexScripts = (ext as any).regex_scripts ?? (ext as any).regexScripts ?? [];
  const regexScripts = (Array.isArray(rawRegexScripts) ? rawRegexScripts : [])
    .filter(Boolean)
    .map((x: any) => fromStRegex(x));

  const rawCharacterBook = (data as any)?.character_book;
  const worldBook = rawCharacterBook
    ? fromStBook(rawCharacterBook, String(rawCharacterBook?.name || rawName || ''))
    : null;

  // 暂时：把剩余字段全部放入 other，方便后续再逐步结构化。
  // 为避免重复塞入“原始正则脚本”，这里从 other.data.extensions 中移除 regex_scripts（如果存在）。
  const other = cloneJson(safeObject(raw));
  if (other?.data?.extensions && typeof other.data.extensions === 'object') {
    delete other.data.extensions.regex_scripts;
    delete other.data.extensions.regexScripts;
  }
  if (other?.data && typeof other.data === 'object') {
    delete other.data.character_book;
    delete other.data.first_mes;
    delete other.data.alternate_greetings;
  }
  delete (other as any).first_mes;
  delete (other as any).alternate_greetings;
  delete (other as any).chat;
  delete (other as any).create_date;

  return {
    name: String(rawName ?? ''),
    description: String(rawDesc ?? ''),
    avatar: String(avatar ?? ''),
    message,
    worldBook,
    regexScripts,
    other,
    chatDate,
    createDate,
  };
}

/**
 * 获取单个角色卡（full）
 */
export async function get(input: GetCharacterInput): Promise<GetCharacterOutput> {
  const avatarUrl = avatarUrlFromName(input?.name);

  const raw = await postJson<any>('/api/characters/get', { avatar_url: avatarUrl }, 'json');
  return { character: toCharacterCard(raw) };
}

/**
 * 列出全部角色卡
 */
export async function list(input: ListCharactersInput = {}): Promise<ListCharactersOutput> {
  const rawList = await postJson<any[]>('/api/characters/all', {}, 'json');

  if (!input?.full) {
    return { characters: (Array.isArray(rawList) ? rawList : []).map((x) => toCharacterCard(x)) };
  }

  const out: CharacterCard[] = [];
  for (const c of Array.isArray(rawList) ? rawList : []) {
    const avatar = getAvatarFromAny(c);
    if (!avatar) continue;
    const full = await get({ name: stripPngSuffix(avatar) });
    out.push(full.character);
  }

  return { characters: out };
}

/**
 * 删除某个角色卡
 */
export async function deleteCharacter(input: DeleteCharacterInput): Promise<DeleteCharacterOutput> {
  const avatarUrl = String(input?.avatarUrl || '').trim();
  if (!avatarUrl) throw new Error('avatarUrl is required');

  await postJson<void>('/api/characters/delete', {
    avatar_url: avatarUrl,
    delete_chats: !!input?.deleteChats,
  }, 'void');

  return { ok: true };
}

/**
 * 修改某个角色卡（deep-merge + v2 校验）
 */
export async function update(input: UpdateCharacterInput): Promise<UpdateCharacterOutput> {
  const avatarUrl = avatarUrlFromName(input?.name);

  const patch = input?.patch ?? {};
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    throw new Error('patch must be an object');
  }

  // 后端 merge-attributes 需要 avatar 字段（注意不是 avatar_url）
  await postJson<void>('/api/characters/merge-attributes', {
    avatar: avatarUrl,
    ...patch,
  }, 'void');

  if (input?.returnCharacter) {
    const updated = await get({ name: input?.name });
    return { ok: true, character: updated.character };
  }

  return { ok: true };
}

