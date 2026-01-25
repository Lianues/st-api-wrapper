import type { RegexScriptData } from '../regexScript/types';
import type { WorldBook } from '../worldBook/types';

export interface CharacterCard {
  /**
   * 角色名称（优先取 data.name）。
   */
  name: string;

  /**
   * 角色描述（优先取 data.description）。
   */
  description: string;

  /**
   * 角色头像文件名（通常以 .png 结尾）。
   * 例："菲米莉丝.png"
   */
  avatar: string;

  /**
   * 角色消息列表（合并 `data.first_mes` 与 `data.alternate_greetings`）。
   * - 第 0 个：first_mes
   * - 第 1..n 个：alternate_greetings 按原顺序追加
   */
  message: string[];

  /**
   * 角色卡绑定的世界书（来源：`data.character_book`）。
   * 若不存在则为 null。
   */
  worldBook: WorldBook | null;

  /**
   * 角色专用正则脚本列表（已按 `regexScript` 模块做结构简化与字段映射）。
   * 注意：这里的转换规则与 `regexScript` 模块保持一致（同一套字段映射）。
   */
  regexScripts: RegexScriptData[];

  /**
   * 其余未整理字段（原始角色卡的剩余内容，方便后续再逐步优化）。
   */
  other: Record<string, any>;

  /**
   * 角色聊天标识/时间（来源：`chat`）。
   * 通常是酒馆用于标识默认聊天的字符串。
   */
  chatDate: string;

  /**
   * 角色卡创建时间（来源：`create_date`）。
   * 通常是 ISO 字符串。
   */
  createDate: string;
}

export interface GetCharacterInput {
  /**
   * 角色名称（用于推导 avatar_url）。
   * - 会自动追加 `.png`（例如传入 "Alice" 会请求 "Alice.png"）
   * - 即便你传入的 name 已经包含 `.png`，也会继续追加（会变成 "Alice.png.png"）
   */
  name: string;
}

export interface GetCharacterOutput {
  character: CharacterCard;
}

export interface ListCharactersInput {
  /**
   * 是否强制返回“完整角色卡”。
   * - false：直接返回 `/api/characters/all` 的结果（可能是 shallow 角色）
   * - true：先拿列表，再逐个调用 `character.get` 拉取 full
   * @default false
   */
  full?: boolean;
}

export interface ListCharactersOutput {
  characters: CharacterCard[];
}

export interface DeleteCharacterInput {
  /**
   * 角色头像文件名（后端字段 avatar_url）。
   * 例："Alice.png"
   */
  avatarUrl: string;

  /**
   * 是否同时删除该角色的聊天记录目录。
   * @default false
   */
  deleteChats?: boolean;
}

export interface DeleteCharacterOutput {
  ok: boolean;
}

export interface UpdateCharacterInput {
  /**
   * 角色名称（用于推导后端字段 avatar）。
   * - 会自动追加 `.png`（例如传入 "Alice" 会使用 avatar="Alice.png"）
   * - 即便你传入的 name 已经包含 `.png`，也会继续追加（会变成 "Alice.png.png"）
   */
  name: string;

  /**
   * 要合并到角色卡的 patch（会 deep-merge 到原角色对象，并进行 TavernCard v2 校验）。
   * 注意：不要在 patch 中包含 json_data。
   */
  patch: Record<string, any>;

  /**
   * 更新后是否返回最新角色卡（会额外调用一次 get）。
   * @default false
   */
  returnCharacter?: boolean;
}

export interface UpdateCharacterOutput {
  ok: boolean;
  character?: CharacterCard;
}

