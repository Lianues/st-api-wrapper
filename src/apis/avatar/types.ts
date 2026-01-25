/**
 * 头像类型
 */
export type AvatarType = 'character' | 'user';

/**
 * 获取头像的输入参数
 */
export interface GetAvatarInput {
  /**
   * 头像类型
   * - 'character': 角色头像
   * - 'user': 用户头像
   */
  type: AvatarType;

  /**
   * 头像名称（不需要包含 .png 后缀，会自动添加）
   * 如果不提供，则获取当前角色/当前用户的头像
   */
  name?: string;
}

/**
 * 头像输出结果
 */
export interface AvatarOutput {
  /** 头像类型 */
  type: AvatarType;
  /** 角色/用户名称 */
  name: string;
  /** 完整头像 URL（相对路径） */
  url: string;
  /** 缩略图 URL（加载更快） */
  thumbnailUrl: string;
  /** 完整图片的 Base64 格式数据（data:image/...;base64,...） */
  base64: string;
  /** 缩略图的 Base64 格式数据（data:image/...;base64,...） */
  thumbnailBase64: string;
  /** 是否是当前选中的（未提供 name 时为 true） */
  isCurrent: boolean;
}

/**
 * 批量获取头像的类型过滤
 */
export type ListAvatarType = 'character' | 'user' | 'all';

/**
 * 批量获取头像的输入参数
 */
export interface ListAvatarsInput {
  /**
   * 头像类型过滤
   * - 'character': 仅角色头像
   * - 'user': 仅用户头像
   * - 'all': 所有头像
   */
  type: ListAvatarType;

  /**
   * 是否返回完整图片的 Base64（默认 false）
   * 注意：开启后会增加加载时间，建议仅在需要时开启
   */
  includeFullBase64?: boolean;
}

/**
 * 批量获取头像的输出
 */
export interface ListAvatarsOutput {
  /** 角色头像列表（当 type 为 'character' 或 'all' 时） */
  characters: AvatarOutput[];
  /** 用户头像列表（当 type 为 'user' 或 'all' 时） */
  users: AvatarOutput[];
  /** 总数量 */
  total: number;
}
