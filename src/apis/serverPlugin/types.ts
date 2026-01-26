/**
 * serverPlugin.* - 管理酒馆后端 Server Plugins（安装/删除/列出/获取/重启）
 *
 * 依赖后端 server plugin:
 * - /api/plugins/server-plugin-manager/*
 */

export type RestartMode = 'respawn' | 'exit';

export interface ServerPluginInfo {
  id: string;
  name: string;
  description: string;
}

export type ServerPluginKind = 'directory' | 'file';

export interface ServerPluginListInput {
  /** 是否尝试读取插件 info（会 import 插件入口文件；默认 true） */
  includeInfo?: boolean;
}

export interface ServerPluginListItem {
  name: string;
  kind: ServerPluginKind;
  path: string;
  entryFile?: string | null;
  entryMissing?: boolean;
  packageJson?: {
    name?: string;
    version?: string;
    main?: string;
  } | null;
  info?: ServerPluginInfo | null;
  infoError?: string | null;
}

export interface ServerPluginListOutput {
  ok: boolean;
  pluginsRoot: string;
  plugins: ServerPluginListItem[];
}

export interface ServerPluginGetInput {
  /** 插件目录名（或插件文件名） */
  name: string;
  includeInfo?: boolean;
}

export type ServerPluginGetOutput =
  | ({
      ok: true;
      name: string;
      kind: ServerPluginKind;
      path: string;
      entryFile?: string | null;
      entryMissing?: boolean;
      packageJson?: {
        name?: string;
        version?: string;
        main?: string;
      } | null;
      info?: ServerPluginInfo | null;
      infoError?: string | null;
    })
  | ({
      ok: false;
      error: string;
    });

export interface ServerPluginAddInput {
  /** git 仓库 URL */
  gitUrl: string;
  /** 目标文件夹名（不填则从 URL 推断） */
  folderName?: string;
  /** 指定分支（可选） */
  branch?: string;
  /** 安装后是否重启（默认 true） */
  restart?: boolean;
  /** 重启方式（默认 respawn） */
  restartMode?: RestartMode;
  /** 重启延迟（毫秒，默认 800） */
  restartDelayMs?: number;
}

export interface SpawnCaptureOutput {
  ok: boolean;
  exitCode: number | null;
  signal?: string | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
  error?: string;
}

export interface ServerPluginAddOutput {
  ok: boolean;
  folderName: string;
  path: string;
  git: SpawnCaptureOutput;
  restart: null | { scheduled: true; mode: RestartMode; delayMs: number };
  error?: string;
}

export interface ServerPluginAddZipInput {
  /** zip 文件 base64（允许 dataURL 形式） */
  zipBase64: string;
  /** 原始文件名（可选；用于推断 folderName） */
  fileName?: string;
  /** 安装目录名（不填则从 fileName 推断） */
  folderName?: string;
  restart?: boolean;
  restartMode?: RestartMode;
  restartDelayMs?: number;
}

export interface ServerPluginAddZipOutput {
  ok: boolean;
  folderName: string;
  path: string;
  extractedCount: number;
  stripPrefix: string;
  restart: null | { scheduled: true; mode: RestartMode; delayMs: number };
  error?: string;
}

export interface ServerPluginAddPathInput {
  /** 服务器本地路径（目录或文件） */
  sourcePath: string;
  /** 安装到 plugins/<folderName>（不填则使用 sourcePath 的 basename） */
  folderName?: string;
  restart?: boolean;
  restartMode?: RestartMode;
  restartDelayMs?: number;
}

export interface ServerPluginAddPathOutput {
  ok: boolean;
  sourcePath: string;
  folderName: string;
  path: string;
  kind: ServerPluginKind | 'unknown';
  restart: null | { scheduled: true; mode: RestartMode; delayMs: number };
  error?: string;
}

export interface ServerPluginDeleteInput {
  /** 插件目录名（或插件文件名） */
  name: string;
  /** 删除后是否重启（默认 true） */
  restart?: boolean;
  restartMode?: RestartMode;
  restartDelayMs?: number;
}

export interface ServerPluginDeleteOutput {
  ok: boolean;
  name?: string;
  kind?: ServerPluginKind | 'unknown';
  restart: null | { scheduled: true; mode: RestartMode; delayMs: number };
  error?: string;
}

export interface ServerPluginRestartInput {
  mode?: RestartMode;
  delayMs?: number;
}

export interface ServerPluginRestartOutput {
  ok: boolean;
  restart: { scheduled: true; mode: RestartMode; delayMs: number };
}

