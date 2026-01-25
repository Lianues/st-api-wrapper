import type { WorldBook, WorldBookEntry, WorldBookEntrySelectiveLogic, WorldBookEntryRole } from '../../apis/worldBook/types';

const reversePositionMap: Record<string, number> = {
  beforeChar: 0,
  afterChar: 1,
  beforeAn: 2,
  afterAn: 3,
  fixed: 4,
  beforeEm: 5,
  afterEm: 6,
  outlet: 7,
};

const reverseRoleMap: Record<WorldBookEntryRole, number> = {
  system: 0,
  user: 1,
  model: 2,
};

const reverseSelectiveLogicMap: Record<WorldBookEntrySelectiveLogic, number> = {
  andAny: 0,
  notAll: 1,
  notAny: 2,
  andAll: 3,
};

function toStEntry(entry: WorldBookEntry): any {
  const stPosition = reversePositionMap[entry.position] ?? (isNaN(Number(entry.position)) ? 0 : Number(entry.position));
  const stRole = entry.position === 'fixed' ? (reverseRoleMap[entry.role || 'system'] ?? 0) : null;
  const stSelectiveLogic = reverseSelectiveLogicMap[entry.selectiveLogic] ?? 0;
  const constant = entry.activationMode === 'always';
  const vectorized = entry.activationMode === 'vector';

  return {
    ...(entry.other || {}),
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
 * 将 wrapper 的 WorldBook 转为酒馆 chatMetadata.world_info 结构（entries map）。
 */
export function worldBookToStWorldInfo(book: WorldBook) {
  const entries: Record<number, any> = {};
  (book.entries || []).forEach((e) => {
    entries[e.index] = toStEntry(e);
  });
  return { name: book.name, entries };
}

