export type WorldBookEntryPosition =
  | 'beforeChar'
  | 'afterChar'
  | 'beforeEm'
  | 'afterEm'
  | 'beforeAn'
  | 'afterAn'
  | 'fixed'
  | 'outlet'
  | string;

export type WorldBookEntryRole = 'system' | 'user' | 'model';

export type WorldBookEntrySelectiveLogic = 'andAny' | 'andAll' | 'notAll' | 'notAny';

export type WorldBookEntryActivationMode = 'always' | 'keyword' | 'vector';

export interface WorldBookEntry {
  /** 对应 ST 的 uid 或 entries 的键 */
  index: number;
  /** 对应 ST 的 comment */
  name: string;
  /** 对应 ST 的 content */
  content: string;
  /** 对应 ST 的 enabled */
  enabled: boolean;
  /** 触发模式。always: 始终触发, keyword: 靠关键词判断触发, vector: 靠向量索引触发 */
  activationMode: WorldBookEntryActivationMode;
  /** 对应 ST 的 key (关键词) */
  key: string[];
  /** 对应 ST 的 keysecondary (副关键词) */
  secondaryKey: string[];
  /** 选择逻辑。andAny: 满足任一副关键词, andAll: 满足所有副关键词, notAll: 不完全满足副关键词, notAny: 不满足任一副关键词 */
  selectiveLogic: WorldBookEntrySelectiveLogic;
  /** 对应 ST 的 order */
  order: number;
  /** 对应 ST 的 depth */
  depth: number;
  /** 对应 ST 的 position (映射为字符串) */
  position: WorldBookEntryPosition;
  /** 对应 ST 的 role (仅在 position 为 fixed 时有效)。不使用时回传 null */
  role: WorldBookEntryRole | null;
  /** 区分大小写。null: 使用全局设置, true: 开启, false: 关闭 */
  caseSensitive: boolean | null;
  /** 是否不可递归（不会被其他条目激活） */
  excludeRecursion: boolean;
  /** 防止进一步递归（不会激活其他条目） */
  preventRecursion: boolean;
  /** 触发概率 (0-100) */
  probability: number;
  /** 其余没有显式提取的原始字段 */
  other: Record<string, any>;
}

export interface WorldBook {
  name: string;
  entries: WorldBookEntry[];
}

export type WorldBookScope = 'global' | 'character' | 'chat';

export interface ListWorldBooksInput {
  scope?: WorldBookScope;
}

export interface ListWorldBooksOutput {
  worldBooks: Array<{
    name: string;
    scope: WorldBookScope;
    /** 如果是 character 或 chat，这里会包含对应的 ID */
    ownerId?: string;
  }>;
}

export interface GetWorldBookInput {
  name: string;
  scope?: WorldBookScope;
}

export interface GetWorldBookOutput {
  worldBook: WorldBook;
  scope: WorldBookScope;
}

export interface UpdateWorldBookInput {
  name: string;
  scope?: WorldBookScope;
  /** 如果提供，则对书进行重命名 */
  newName?: string;
  /** 如果提供，则覆盖整本书的所有条目 */
  entries?: WorldBookEntry[];
}

export interface UpdateWorldBookOutput {
  ok: boolean;
  name: string;
}

export interface CreateWorldBookInput {
  name: string;
  scope?: WorldBookScope;
  /** 可选：初始条目列表 */
  entries?: WorldBookEntry[];
}

export interface CreateWorldBookOutput {
  name: string;
  ok: boolean;
}

export interface DeleteWorldBookInput {
  name: string;
  scope?: WorldBookScope;
}

export interface DeleteWorldBookOutput {
  ok: boolean;
}

export interface CreateWorldBookEntryInput {
  name: string;
  scope?: WorldBookScope;
  entry: Partial<Omit<WorldBookEntry, 'index'>>;
}

export interface CreateWorldBookEntryOutput {
  entry: WorldBookEntry;
  ok: boolean;
}

export interface UpdateWorldBookEntryInput {
  name: string;
  scope?: WorldBookScope;
  index: number;
  patch: Partial<Omit<WorldBookEntry, 'index'>>;
}

export interface UpdateWorldBookEntryOutput {
  entry: WorldBookEntry;
  ok: boolean;
}

export interface DeleteWorldBookEntryInput {
  name: string;
  scope?: WorldBookScope;
  index: number;
}

export interface DeleteWorldBookEntryOutput {
  ok: boolean;
}

export interface GetWorldBookEntryInput {
  name: string;
  scope?: WorldBookScope;
  index: number;
}

export interface GetWorldBookEntryOutput {
  entry: WorldBookEntry;
}
