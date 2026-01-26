/**
 * command.* - 通过酒馆 Server Plugin (command-exec) 执行后端命令
 *
 * 后端路径固定为：
 * - /api/plugins/command-exec/*
 */

export type TerminalType =
  | 'auto'
  | 'powershell'
  | 'pwsh'
  | 'cmd'
  | 'bash'
  | 'sh'
  | 'zsh'
  | 'fish'
  | 'custom';

export interface CommandProbeInput {
  /** 是否返回 env（默认 false） */
  includeEnv?: boolean;
  /** includeEnv=true 时，是否返回全量 env（默认 false，仅返回常用子集） */
  includeEnvAll?: boolean;

  /** （可选）用于预览 script 模式下的终端解析 */
  terminal?: TerminalType;
  /** （可选）直接指定终端可执行文件路径/命令 */
  terminalCommand?: string;
  /** （可选）终端参数模板数组，支持 `{{script}}` 占位符 */
  terminalArgs?: string[];
}

export interface CommandProbeOutput {
  ok: boolean;
  plugin?: {
    id: string;
    name: string;
    description: string;
  };
  platform?: string;
  node?: {
    version?: string;
  };
  /** 后端自动选择的默认终端（script 模式） */
  defaultTerminal?: {
    type: TerminalType;
    command: string;
    argsTemplate: string[];
    source: string;
  };
  /** 按输入解析后的终端（script 模式） */
  terminal?: {
    type: TerminalType;
    command: string;
    argsTemplate: string[];
    source: string;
  };
  env?: Record<string, string>;
}

export interface CommandEnvInput {
  /** 返回全量环境变量（默认 false） */
  all?: boolean;
  /** 指定需要读取的 key 列表（优先级高于默认子集；低于 all=true） */
  keys?: string[];
}

export interface CommandEnvOutput {
  ok: boolean;
  env: Record<string, string>;
}

export interface CommandWhichInput {
  /** 查询命令（默认 "python"） */
  query?: string;
  /** 超时毫秒（默认 5000） */
  timeoutMs?: number;
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

export interface CommandWhichOutput extends SpawnCaptureOutput {
  query: string;
  /** 执行的系统命令描述（例如 "where" 或 "which -a"） */
  command: string;
  results: string[];
}

export interface CommandRunInput {
  /**
   * direct 模式：直接执行 command + args（不依赖 shell）
   * - 当 script 为空时使用
   */
  command?: string;
  args?: string[];

  /**
   * script 模式：通过终端执行脚本字符串（支持按平台自动选择终端）
   * - 优先级高于 command
   */
  script?: string;
  terminal?: TerminalType;
  terminalCommand?: string;
  /** 终端参数模板数组，支持 `{{script}}` 占位符 */
  terminalArgs?: string[];

  /** 传入 stdin（可选） */
  stdin?: string;
  /** 工作目录（可选） */
  cwd?: string;
  /** 超时毫秒（可选） */
  timeoutMs?: number;
  /** 额外环境变量（可选；会覆盖后端已有 env 同名字段） */
  env?: Record<string, string | number | boolean | null | undefined>;

  /**
   * 输出解码（stdout/stderr）
   *
   * - 默认：`auto`
   * - Windows 常见：`gbk`（避免中文路径/文件名出现 `�`）
   * - 也可指定：`utf8` / `utf16le` / `cp936` 等（取决于后端 iconv-lite 支持）
   */
  outputEncoding?: string;
}

export type CommandRunMode = 'direct' | 'script';

export type CommandRunOutput =
  | (SpawnCaptureOutput & {
      mode: 'direct';
      command: string;
      args: string[];
      cwd: string | null;
    })
  | (SpawnCaptureOutput & {
      mode: 'script';
      script: string;
      terminal: {
        type: TerminalType;
        command: string;
        source: string;
        args: string[];
        argsTemplate: string[];
      };
      cwd: string | null;
    });

