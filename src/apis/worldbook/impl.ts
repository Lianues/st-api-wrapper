import type {
  CreateWorldBookEntryInput,
  CreateWorldBookEntryOutput,
  CreateWorldBookInput,
  CreateWorldBookOutput,
  DeleteWorldBookEntryInput,
  DeleteWorldBookEntryOutput,
  DeleteWorldBookInput,
  DeleteWorldBookOutput,
  GetWorldBookInput,
  GetWorldBookOutput,
  ListWorldBooksInput,
  ListWorldBooksOutput,
  UpdateWorldBookEntryInput,
  UpdateWorldBookEntryOutput,
  UpdateWorldBookInput,
  UpdateWorldBookOutput,
  GetWorldBookEntryInput,
  GetWorldBookEntryOutput,
  WorldBook,
  WorldBookEntry,
  WorldBookEntryActivationMode,
  WorldBookEntryRole,
  WorldBookEntrySelectiveLogic,
  WorldBookScope,
} from './types';

/**
 * 获取 SillyTavern 的上下文
 */
function getSTContext() {
  return (window as any).SillyTavern?.getContext?.();
}

/**
 * 触发酒馆设置面板和全局状态的刷新
 */
async function triggerSettingsRefresh() {
  const ctx = getSTContext();
  if (!ctx) return;

  // 1. 刷新世界书列表变量 (world_names)
  if (ctx.updateWorldInfoList) {
    await ctx.updateWorldInfoList();
  }

  // 2. 触发设置保存和面板刷新事件
  if (ctx.saveSettingsDebounced) {
    ctx.saveSettingsDebounced();
  }
  
  if (ctx.eventSource && ctx.eventTypes) {
    // 触发预设/设置变更事件，这会让酒馆的 UI 面板（如正则、世界书列表）重新加载
    ctx.eventSource.emit(ctx.eventTypes.SETTINGS_UPDATED);
    ctx.eventSource.emit(ctx.eventTypes.PRESET_CHANGED);
  }
}

const positionMap: Record<number, string> = {
  0: 'beforeChar',
  1: 'afterChar',
  2: 'beforeAn',
  3: 'afterAn',
  4: 'fixed',
  5: 'beforeEm',
  6: 'afterEm',
  7: 'outlet',
};

const reversePositionMap: Record<string, number> = {
  'beforeChar': 0,
  'afterChar': 1,
  'beforeAn': 2,
  'afterAn': 3,
  'fixed': 4,
  'beforeEm': 5,
  'afterEm': 6,
  'outlet': 7,
};

const roleMap: Record<number, WorldBookEntryRole> = {
  0: 'system',
  1: 'user',
  2: 'model',
};

const reverseRoleMap: Record<string, number> = {
  'system': 0,
  'user': 1,
  'model': 2,
};

const selectiveLogicMap: Record<number, WorldBookEntrySelectiveLogic> = {
  0: 'andAny',
  1: 'notAll',
  2: 'notAny',
  3: 'andAll',
};

const reverseSelectiveLogicMap: Record<string, number> = {
  'andAny': 0,
  'notAll': 1,
  'notAny': 2,
  'andAll': 3,
};

function fromStEntry(stEntry: any, index: number): WorldBookEntry {
  const {
    comment,
    content,
    enabled,
    disable,
    order,
    depth,
    position,
    role,
    key,
    keysecondary,
    selectiveLogic,
    caseSensitive,
    excludeRecursion,
    preventRecursion,
    constant,
    vectorized,
    probability,
    useProbability,
    ...other
  } = stEntry;
  const mappedPosition = positionMap[position] || String(position);

  let activationMode: WorldBookEntryActivationMode = 'keyword';
  if (constant) {
    activationMode = 'always';
  } else if (vectorized) {
    activationMode = 'vector';
  }

  // 直接使用 disable 转换为包装的 enabled
  const finalEnabled = !disable;

  const entry: WorldBookEntry = {
    index: Number(index),
    name: comment || '',
    content: content || '',
    enabled: finalEnabled,
    activationMode,
    order: typeof order === 'number' ? order : 100,
    depth: typeof depth === 'number' ? depth : 4,
    position: mappedPosition as any,
    role: mappedPosition === 'fixed' ? (roleMap[role] || 'system') : null,
    key: Array.isArray(key) ? key : [],
    secondaryKey: Array.isArray(keysecondary) ? keysecondary : [],
    selectiveLogic: selectiveLogicMap[selectiveLogic] || 'andAny',
    caseSensitive: caseSensitive === undefined ? null : caseSensitive,
    excludeRecursion: !!excludeRecursion,
    preventRecursion: !!preventRecursion,
    probability: typeof probability === 'number' ? probability : 100,
    other: {
      ...other,
      useProbability: useProbability !== undefined ? useProbability : true,
    },
  };

  return entry;
}

function toStEntry(entry: WorldBookEntry): any {
  const stPosition = reversePositionMap[entry.position] ?? (isNaN(Number(entry.position)) ? 0 : Number(entry.position));
  const stRole = entry.position === 'fixed' ? (reverseRoleMap[entry.role || 'system'] ?? 0) : null;
  const stSelectiveLogic = reverseSelectiveLogicMap[entry.selectiveLogic] ?? 0;
  const constant = entry.activationMode === 'always';
  const vectorized = entry.activationMode === 'vector';

  return {
    ...entry.other,
    uid: entry.index,
    comment: entry.name,
    content: entry.content,
    disable: !entry.enabled,
    constant,
    vectorized,
    order: entry.order,
    depth: entry.depth,
    position: stPosition,
    role: stRole,
    key: entry.key,
    keysecondary: entry.secondaryKey,
    selectiveLogic: stSelectiveLogic,
    caseSensitive: entry.caseSensitive,
    excludeRecursion: entry.excludeRecursion,
    preventRecursion: entry.preventRecursion,
    probability: entry.probability,
  };
}

/**
 * 将角色卡内置的 character_book（Spec v2/v3）条目转换为 wrapper 的 WorldBookEntry 结构。
 * 备注：character_book 的 entries 常见为数组结构，与 world_info 的 entries-map 不同。
 */
function fromStCharacterBookEntry(stEntry: any): WorldBookEntry {
  const {
    id,
    comment,
    content,
    enabled,
    constant,
    keys,
    secondary_keys,
    insertion_order,
    position,
    extensions,
    ...other
  } = stEntry ?? {};

  const ext: any = extensions ?? {};

  // position: 优先使用 extensions.position (数字)，其次使用字符串 position（before_char/after_char 等）
  const posRaw = ext.position ?? position;
  let mappedPosition: any = 'beforeChar';
  if (typeof posRaw === 'number') {
    mappedPosition = positionMap[posRaw] || String(posRaw);
  } else if (typeof posRaw === 'string') {
    switch (posRaw) {
      case 'before_char': mappedPosition = 'beforeChar'; break;
      case 'after_char': mappedPosition = 'afterChar'; break;
      case 'before_em': mappedPosition = 'beforeEm'; break;
      case 'after_em': mappedPosition = 'afterEm'; break;
      case 'before_an': mappedPosition = 'beforeAn'; break;
      case 'after_an': mappedPosition = 'afterAn'; break;
      case 'fixed': mappedPosition = 'fixed'; break;
      case 'outlet': mappedPosition = 'outlet'; break;
      default: mappedPosition = posRaw;
    }
  }

  // activation
  let activationMode: WorldBookEntryActivationMode = 'keyword';
  if (constant) activationMode = 'always';
  else if (ext.vectorized) activationMode = 'vector';

  const selectiveLogicRaw = ext.selectiveLogic ?? ext.selective_logic;
  const mappedSelectiveLogic =
    typeof selectiveLogicRaw === 'number'
      ? (selectiveLogicMap[selectiveLogicRaw] || 'andAny')
      : (typeof selectiveLogicRaw === 'string' ? (selectiveLogicRaw as any) : 'andAny');

  const roleRaw = ext.role;
  const mappedRole =
    mappedPosition === 'fixed'
      ? (typeof roleRaw === 'number' ? (roleMap[roleRaw] || 'system') : (roleRaw || 'system'))
      : null;

  const caseSensitive = (ext.case_sensitive ?? ext.caseSensitive);

  return {
    index: Number(id ?? 0),
    name: comment || '',
    content: content || '',
    enabled: enabled === undefined ? true : !!enabled,
    activationMode,
    key: Array.isArray(keys) ? keys : [],
    secondaryKey: Array.isArray(secondary_keys) ? secondary_keys : [],
    selectiveLogic: mappedSelectiveLogic,
    order: typeof insertion_order === 'number' ? insertion_order : 100,
    depth: typeof ext.depth === 'number' ? ext.depth : 4,
    position: mappedPosition,
    role: mappedRole,
    caseSensitive: caseSensitive === undefined ? null : caseSensitive,
    excludeRecursion: !!(ext.exclude_recursion ?? ext.excludeRecursion),
    preventRecursion: !!(ext.prevent_recursion ?? ext.preventRecursion),
    probability: typeof ext.probability === 'number' ? ext.probability : 100,
    other: {
      ...other,
      extensions: ext,
    },
  };
}

export function fromStBook(stBook: any, name: string): WorldBook {
  const entries: WorldBookEntry[] = [];

  const rawEntries = stBook?.entries;
  if (Array.isArray(rawEntries)) {
    rawEntries.forEach((e: any) => entries.push(fromStCharacterBookEntry(e)));
  } else if (rawEntries && typeof rawEntries === 'object') {
    Object.keys(rawEntries).forEach(key => {
      entries.push(fromStEntry(rawEntries[key], Number(key)));
    });
  }

  return { name, entries };
}

/**
 * 列表所有世界书
 */
export async function listWorldBooks(input: ListWorldBooksInput = {}): Promise<ListWorldBooksOutput> {
  const worldBooks: ListWorldBooksOutput['worldBooks'] = [];
  const ctx = getSTContext();

  const scope = input?.scope;

  // 1. 全局书
  if (!scope || scope === 'global') {
    // 优先调用酒馆原生的刷新函数，确保内存中的 world_names 是最新的
    if (ctx?.updateWorldInfoList) {
      await ctx.updateWorldInfoList();
    }

    // 尝试从酒馆暴露的全局变量或 context 中获取
    // 在酒馆中，world_names 是一个存储所有全局世界书名称的数组
    const worldNames = (window as any).world_names || ctx?.world_names || [];
    
    if (Array.isArray(worldNames)) {
      worldNames.forEach((name: string) => {
        // 避免重复（如果多次刷新或来源重叠）
        if (!worldBooks.find(b => b.name === name && b.scope === 'global')) {
          worldBooks.push({ name, scope: 'global' });
        }
      });
    }
  }

  // 2. 角色书
  if (!scope || scope === 'character') {
    const characters = ctx?.characters || [];
    const currentChid = ctx?.characterId;
    if (typeof currentChid === 'number' && characters[currentChid]) {
      const char = characters[currentChid];
      if (char.data?.character_book) {
        worldBooks.push({ name: char.name, scope: 'character', ownerId: String(currentChid) });
      }
    }
  }

  // 3. 聊天书
  if (!scope || scope === 'chat') {
    const chatMetadata = ctx?.chatMetadata;
    if (chatMetadata?.world_info) {
      worldBooks.push({ name: 'Current Chat', scope: 'chat', ownerId: ctx?.chatId });
    }
  }

  return { worldBooks };
}

/**
 * 获取单本世界书
 */
export async function getWorldBook(input: GetWorldBookInput): Promise<GetWorldBookOutput> {
  const ctx = getSTContext();
  
  // 逻辑：如果没传 scope，按 global -> character -> chat 找
  const scopes: WorldBookScope[] = input.scope ? [input.scope] : ['global', 'character', 'chat'];

  for (const scope of scopes) {
    if (scope === 'global') {
      // 优先使用酒馆原生的 loadWorldInfo 函数，它能处理缓存和各种复杂逻辑
      if (ctx?.loadWorldInfo) {
        const data = await ctx.loadWorldInfo(input.name);
        if (data && data.entries) {
          return { worldBook: fromStBook(data, input.name), scope: 'global' };
        }
      }

      try {
        // 不再检查前端 world_names 变量，直接尝试从后端获取
        const resp = await fetch('/api/worldinfo/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...ctx?.getRequestHeaders?.() },
          body: JSON.stringify({ name: input.name }),
        });
        if (resp.ok) {
          const data = await resp.json();
          // 如果返回的数据有效，则认为找到了
          if (data && data.entries) {
            return { worldBook: fromStBook(data, input.name), scope: 'global' };
          }
        }
      } catch (e) {
        // 如果 global 尝试失败（如网络错误），继续尝试其他 scope
        console.debug(`[ST API] Global check failed for ${input.name}, trying next scope.`);
      }
    }
    
    if (scope === 'character') {
      const char = ctx?.characters[ctx?.characterId];
      // 匹配角色名或内置书名
      const isMatch = char?.name === input.name || char?.data?.character_book?.name === input.name;
      if (isMatch && char?.data?.character_book) {
        return { 
          worldBook: fromStBook(char.data.character_book, char.data.character_book.name || char.name), 
          scope: 'character' 
        };
      }
    }

    if (scope === 'chat') {
      if (input.name === 'Current Chat' || input.name === ctx?.chatId) {
        const chatMetadata = ctx?.chatMetadata;
        if (chatMetadata?.world_info) {
          return {
            worldBook: fromStBook(chatMetadata.world_info, 'Current Chat'),
            scope: 'chat'
          };
        }
      }
    }
  }

  throw new Error(`WorldBook not found: ${input.name}`);
}

/**
 * 更新世界书（覆盖内容或重命名）
 */
export async function updateWorldBook(input: UpdateWorldBookInput): Promise<UpdateWorldBookOutput> {
  const { worldBook, scope } = await getWorldBook({ name: input.name, scope: input.scope });
  const ctx = getSTContext();

  // 1. 如果提供了新内容，先更新内容
  if (input.entries) {
    worldBook.entries = input.entries;
    await saveWorldBookInternal(worldBook, scope);
  }

  // 2. 如果提供了新名字，进行重命名
  if (input.newName && input.newName !== input.name) {
    if (scope === 'global') {
      // 全局书重命名：保存新名 + 删除旧名
      await saveWorldBookInternal({ name: input.newName, entries: worldBook.entries }, 'global');
      await deleteWorldBook({ name: input.name, scope: 'global' });
    } else if (scope === 'character') {
      const char = ctx?.characters[ctx?.characterId];
      if (char && char.data?.character_book) {
        char.data.character_book.name = input.newName;
        if (ctx.saveCharacterDebounced) await ctx.saveCharacterDebounced();
      }
    } else if (scope === 'chat') {
      const chatMetadata = ctx?.chatMetadata;
      if (chatMetadata?.world_info) {
        chatMetadata.world_info.name = input.newName;
        if (ctx.saveMetadataDebounced) ctx.saveMetadataDebounced();
      }
    }
    await triggerSettingsRefresh();
    return { ok: true, name: input.newName };
  }

  await triggerSettingsRefresh();
  return { ok: true, name: input.name };
}

/**
 * 创建世界书
 */
export async function createWorldBook(input: CreateWorldBookInput): Promise<CreateWorldBookOutput> {
  const ctx = getSTContext();
  const scope = input.scope || 'global';

  const stEntries: Record<number, any> = {};
  if (input.entries) {
    input.entries.forEach(e => {
      stEntries[e.index] = toStEntry(e);
    });
  }

  if (scope === 'global') {
    const resp = await fetch('/api/worldinfo/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...ctx?.getRequestHeaders?.() },
      body: JSON.stringify({ name: input.name, data: { entries: stEntries } }),
    });
    
    if (resp.ok) {
      await triggerSettingsRefresh();
      return { name: input.name, ok: true };
    }
  } else if (scope === 'character') {
    const char = ctx?.characters[ctx?.characterId];
    if (char) {
      char.data = char.data || {};
      char.data.character_book = { name: input.name, entries: stEntries };
      if (ctx.saveCharacterDebounced) await ctx.saveCharacterDebounced();
      await triggerSettingsRefresh();
      return { name: input.name, ok: true };
    }
  } else if (scope === 'chat') {
    const chatMetadata = ctx?.chatMetadata;
    if (chatMetadata) {
      chatMetadata.world_info = { name: input.name, entries: stEntries };
      if (ctx.saveMetadataDebounced) ctx.saveMetadataDebounced();
      await triggerSettingsRefresh();
      return { name: input.name, ok: true };
    }
  }

  return { name: input.name, ok: false };
}

/**
 * 删除世界书
 */
export async function deleteWorldBook(input: DeleteWorldBookInput): Promise<DeleteWorldBookOutput> {
  const ctx = getSTContext();
  const scope = input.scope || 'global';

  if (scope === 'global') {
    const resp = await fetch('/api/worldinfo/delete', {
      method: 'POST',
     headers: { 'Content-Type': 'application/json', ...ctx?.getRequestHeaders?.() },
      body: JSON.stringify({ name: input.name }),
    });
    
    if (resp.ok) {
      await triggerSettingsRefresh();
      return { ok: true };
    }
  } else if (scope === 'character') {
    const char = ctx?.characters[ctx?.characterId];
    if (char && char.data?.character_book) {
      delete char.data.character_book;
      if (ctx.saveCharacterDebounced) await ctx.saveCharacterDebounced();
      await triggerSettingsRefresh();
      return { ok: true };
    }
  } else if (scope === 'chat') {
    const chatMetadata = ctx?.chatMetadata;
    if (chatMetadata?.world_info) {
      delete chatMetadata.world_info;
      if (ctx.saveMetadataDebounced) ctx.saveMetadataDebounced();
      await triggerSettingsRefresh();
      return { ok: true };
    }
  }

  return { ok: false };
}

/**
 * 获取指定条目
 */
export async function getWorldBookEntry(input: GetWorldBookEntryInput): Promise<GetWorldBookEntryOutput> {
  const { worldBook } = await getWorldBook({ name: input.name, scope: input.scope });
  
  const entry = worldBook.entries.find(e => e.index === input.index);
  if (!entry) {
    throw new Error(`Entry ${input.index} not found in book ${input.name}`);
  }

  return { entry };
}

/**
 * 在世界书中创建条目
 */
export async function createWorldBookEntry(input: CreateWorldBookEntryInput): Promise<CreateWorldBookEntryOutput> {
  const { worldBook, scope } = await getWorldBook({ name: input.name, scope: input.scope });

  // 获取新 UID
  let maxUid = -1;
  worldBook.entries.forEach(e => {
    maxUid = Math.max(maxUid, e.index);
  });
  const newUid = maxUid + 1;

  const newEntry: WorldBookEntry = {
    index: newUid,
    name: '',
    content: '',
    enabled: true,
    activationMode: 'keyword',
    order: 100,
    depth: 4,
    position: 'beforeChar',
    role: null,
    key: [],
    secondaryKey: [],
    selectiveLogic: 'andAny',
    caseSensitive: null,
    excludeRecursion: false,
    preventRecursion: false,
    probability: 100,
    other: {
      selective: false,
      useProbability: true,
      recursive: false,
      matchWholeWords: true,
      useGroupScoring: false,
      automationId: '',
    },
    ...input.entry,
  };

  worldBook.entries.push(newEntry);

  // 保存
  await saveWorldBookInternal(worldBook, scope);

  return { entry: newEntry, ok: true };
}

/**
 * 更新条目
 */
export async function updateWorldBookEntry(input: UpdateWorldBookEntryInput): Promise<UpdateWorldBookEntryOutput> {
  const { worldBook, scope } = await getWorldBook({ name: input.name, scope: input.scope });
  
  const entryIndex = worldBook.entries.findIndex(e => e.index === input.index);
  if (entryIndex === -1) {
    throw new Error(`Entry ${input.index} not found in book ${input.name}`);
  }

  const updatedEntry = { ...worldBook.entries[entryIndex], ...input.patch };
  worldBook.entries[entryIndex] = updatedEntry;

  await saveWorldBookInternal(worldBook, scope);

  return { entry: updatedEntry, ok: true };
}

/**
 * 删除条目
 */
export async function deleteWorldBookEntry(input: DeleteWorldBookEntryInput): Promise<DeleteWorldBookEntryOutput> {
  const { worldBook, scope } = await getWorldBook({ name: input.name, scope: input.scope });
  
  const entryIndex = worldBook.entries.findIndex(e => e.index === input.index);
  if (entryIndex === -1) {
    return { ok: true }; // 已经没了
  }

  worldBook.entries.splice(entryIndex, 1);

  await saveWorldBookInternal(worldBook, scope);

  return { ok: true };
}

/**
 * 内部保存逻辑，处理不同作用域
 */
async function saveWorldBookInternal(book: WorldBook, scope: WorldBookScope) {
  const ctx = getSTContext();

  // 转换为 ST 格式
  const stEntries: Record<number, any> = {};
  book.entries.forEach(e => {
    stEntries[e.index] = toStEntry(e);
  });

  if (scope === 'global') {
    // 优先使用酒馆原生的 saveWorldInfo 函数，它能处理缓存、事件通知和 UI 刷新
    if (ctx?.saveWorldInfo) {
      await ctx.saveWorldInfo(book.name, { entries: stEntries }, true);
    } else {
      // 备选方案：直接使用 fetch 访问后端接口
      await fetch('/api/worldinfo/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ctx?.getRequestHeaders?.() },
        body: JSON.stringify({ name: book.name, data: { entries: stEntries } }),
      });

      // 发送事件通知酒馆内部世界书已更新
      if (ctx?.eventSource && ctx?.eventTypes) {
        ctx.eventSource.emit(ctx.eventTypes.WORLDINFO_UPDATED, book.name, { entries: stEntries });
      }

      // 如果当前编辑器正开着这本书，尝试刷新 UI
      if ((window as any).selected_world_info === book.name && (window as any).reloadEditor) {
        (window as any).world_info = stEntries;
        (window as any).reloadEditor();
      }
    }
  } else if (scope === 'character') {
    const char = ctx?.characters[ctx?.characterId];
    if (char && char.data?.character_book) {
      char.data.character_book.entries = stEntries;
      // 触发角色保存
      if (ctx.saveCharacterDebounced) {
        await ctx.saveCharacterDebounced();
      }
    }
  } else if (scope === 'chat') {
    const chatMetadata = ctx?.chatMetadata;
    if (chatMetadata?.world_info) {
      chatMetadata.world_info.entries = stEntries;
      // 触发元数据保存
      if (ctx.saveMetadataDebounced) ctx.saveMetadataDebounced();
    }
  }

  await triggerSettingsRefresh();
}
