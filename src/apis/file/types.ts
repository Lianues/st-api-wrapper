export interface UploadInput {
  /** 文件 Base64 内容 (支持带 Data URL 标头) */
  data: string;
  /** 文件后缀名 (如 'png', 'pdf', 'txt') */
  format: string;
  /** 存入的文件名 (不含后缀，若重复则覆盖) */
  fileName: string;
  /** 存储文件夹名称 (若 useCharacterDir 为 true 则被忽略) */
  chName?: string;
  /** 
   * 是否使用当前活跃角色的目录
   * @default false
   */
  useCharacterDir?: boolean;
}

export interface UploadOutput {
  /** 上传成功后的服务器相对路径 */
  path: string;
}

export interface GetInput {
  /** 直接提供文件的服务器相对路径或完整 URL */
  url?: string;
  /** 存储文件夹名称 (若 useCharacterDir 为 true 则被忽略) */
  chName?: string;
  /** 文件名 (不含后缀) */
  fileName?: string;
  /** 文件后缀名 (如 'png', 'txt') */
  format?: string;
  /** 
   * 是否使用当前活跃角色的目录
   * @default false
   */
  useCharacterDir?: boolean;
}

export interface GetOutput {
  /** 文件的 Base64 内容 */
  data: string;
  /** MIME 类型 */
  mimeType: string;
}

export interface ListInput {
  /** 存储文件夹名称 (若 useCharacterDir 为 true 则被忽略) */
  chName?: string;
  /** 
   * 是否使用当前活跃角色的目录
   * @default false
   */
  useCharacterDir?: boolean;
}

export interface FileInfo {
  /** 文件名 (含后缀) */
  name: string;
  /** 服务器相对路径 */
  path: string;
  /** 文件大小 (字节) */
  size: number;
  /** 最后修改时间 */
  mtime: number;
}

export interface ListOutput {
  files: FileInfo[];
}

export interface DeleteInput {
  /** 直接提供文件的服务器相对路径 */
  url?: string;
  /** 存储文件夹名称 (若 useCharacterDir 为 true 则被忽略) */
  chName?: string;
  /** 文件名 (不含后缀)。如果不传，则尝试删除整个文件夹。 */
  fileName?: string;
  /** 文件后缀名 (如 'png', 'txt') */
  format?: string;
  /** 
   * 是否使用当前活跃角色的目录
   * @default false
   */
  useCharacterDir?: boolean;
}

export interface DeleteOutput {
  success: boolean;
}
