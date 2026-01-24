import type {
  RegisterSlashCommandInput,
  RegisterSlashCommandOutput,
  UnregisterSlashCommandInput,
  UnregisterSlashCommandOutput,
  ListSlashCommandsOutput,
  SlashCommandContext,
  ExecuteSlashCommandInput,
  ExecuteSlashCommandOutput,
} from './types';

// 存储已注册的指令，用于注销
const registeredCommands = new Map<string, unknown>();

/**
 * 获取 SillyTavern 的 SlashCommandParser
 */
function getSlashCommandParser(): any {
  const ctx = (window as any).SillyTavern?.getContext?.();
  return ctx?.SlashCommandParser;
}

/**
 * 获取 SillyTavern 的 SlashCommand 类
 */
function getSlashCommandClass(): any {
  const ctx = (window as any).SillyTavern?.getContext?.();
  return ctx?.SlashCommand;
}

/**
 * 获取 SillyTavern 的斜杠指令参数类
 */
function getSlashCommandArgClasses(): {
  SlashCommandArgument: any;
  SlashCommandNamedArgument: any;
  ARGUMENT_TYPE: any;
} | null {
  const ctx = (window as any).SillyTavern?.getContext?.();
  if (!ctx) return null;
  return {
    SlashCommandArgument: ctx.SlashCommandArgument,
    SlashCommandNamedArgument: ctx.SlashCommandNamedArgument,
    ARGUMENT_TYPE: ctx.ARGUMENT_TYPE,
  };
}

/**
 * 将类型字符串转换为 ARGUMENT_TYPE 枚举值
 */
function mapArgumentType(type: string, ARGUMENT_TYPE: any): any {
  const mapping: Record<string, string> = {
    string: 'STRING',
    number: 'NUMBER',
    boolean: 'BOOLEAN',
    enum: 'ENUM',
    variable: 'VARIABLE',
    closure: 'CLOSURE',
    list: 'LIST',
    dictionary: 'DICTIONARY',
  };
  const key = mapping[type] || 'STRING';
  return ARGUMENT_TYPE?.[key] ?? type;
}

/**
 * 注册斜杠指令
 */
export async function registerSlashCommand(
  input: RegisterSlashCommandInput
): Promise<RegisterSlashCommandOutput> {
  const parser = getSlashCommandParser();
  const SlashCommand = getSlashCommandClass();
  const argClasses = getSlashCommandArgClasses();

  if (!parser) {
    throw new Error('SlashCommandParser not available in SillyTavern context');
  }

  // 检查是否已注册
  if (registeredCommands.has(input.name)) {
    throw new Error(`Slash command already registered: /${input.name}`);
  }

  // 包装回调函数，适配 SillyTavern 的调用方式
  const wrappedCallback = async (args: any, value: string) => {
    const context: SlashCommandContext = {
      namedArgs: args || {},
      unnamedArgs: value || '',
      value,
    };
    const result = await input.callback(context);
    return result ?? '';
  };

  // 构建参数定义
  let unnamedArgs: any[] = [];
  let namedArgs: any[] = [];

  if (argClasses && input.unnamedArgumentList) {
    const { SlashCommandArgument, ARGUMENT_TYPE } = argClasses;
    if (SlashCommandArgument) {
      unnamedArgs = input.unnamedArgumentList.map((arg) => {
        const typeList = arg.typeList?.map((t) => mapArgumentType(t, ARGUMENT_TYPE)) || [];
        return SlashCommandArgument.fromProps({
          description: arg.description || '',
          typeList,
          isRequired: arg.isRequired ?? false,
          defaultValue: arg.defaultValue,
          enumList: arg.enumList,
          acceptsMultiple: arg.acceptsMultiple,
        });
      });
    }
  }

  if (argClasses && input.namedArgumentList) {
    const { SlashCommandNamedArgument, ARGUMENT_TYPE } = argClasses;
    if (SlashCommandNamedArgument) {
      namedArgs = input.namedArgumentList.map((arg) => {
        const typeList = arg.typeList?.map((t) => mapArgumentType(t, ARGUMENT_TYPE)) || [];
        return SlashCommandNamedArgument.fromProps({
          name: arg.name,
          description: arg.description || '',
          typeList,
          isRequired: arg.isRequired ?? false,
          defaultValue: arg.defaultValue,
          enumList: arg.enumList,
          acceptsMultiple: arg.acceptsMultiple,
        });
      });
    }
  }

  // 使用新版 API（SlashCommand 类）或旧版 API
  if (SlashCommand && parser.addCommandObject) {
    const command = SlashCommand.fromProps({
      name: input.name,
      callback: wrappedCallback,
      aliases: input.aliases || [],
      helpString: input.helpString || '',
      interruptsGeneration: input.interruptsGeneration ?? false,
      purgeFromMessage: input.purgeFromMessage ?? true,
      unnamedArgumentList: unnamedArgs,
      namedArgumentList: namedArgs,
      returns: input.returns,
      isHidden: input.hidden ?? false,
    });

    parser.addCommandObject(command);
    registeredCommands.set(input.name, command);
  } else if (parser.addCommand) {
    // 旧版 API 兼容
    parser.addCommand(
      input.name,
      wrappedCallback,
      input.aliases || [],
      input.helpString || '',
      input.interruptsGeneration ?? false,
      input.purgeFromMessage ?? true
    );
    registeredCommands.set(input.name, { name: input.name });
  } else {
    throw new Error('No suitable slash command registration API found');
  }

  return { name: input.name, ok: true };
}

/**
 * 注销斜杠指令
 */
export async function unregisterSlashCommand(
  input: UnregisterSlashCommandInput
): Promise<UnregisterSlashCommandOutput> {
  const parser = getSlashCommandParser();

  if (!parser) {
    throw new Error('SlashCommandParser not available in SillyTavern context');
  }

  if (!registeredCommands.has(input.name)) {
    // 指令不存在或不是通过此 API 注册的
    return { ok: false };
  }

  // 尝试从 parser 中移除
  if (parser.commands && parser.commands instanceof Map) {
    parser.commands.delete(input.name);
  } else if (parser.commands && typeof parser.commands === 'object') {
    delete parser.commands[input.name];
  }

  registeredCommands.delete(input.name);
  return { ok: true };
}

/**
 * 列出所有已注册的斜杠指令
 */
export async function listSlashCommands(): Promise<ListSlashCommandsOutput> {
  const parser = getSlashCommandParser();

  if (!parser || !parser.commands) {
    return { commands: [] };
  }

  const commands: ListSlashCommandsOutput['commands'] = [];

  // 处理 Map 或 Object 类型的 commands
  const entries: Array<[string, unknown]> =
    parser.commands instanceof Map
      ? Array.from(parser.commands.entries() as Iterable<[string, unknown]>)
      : Object.entries(parser.commands as Record<string, unknown>);

  for (const [name, cmd] of entries) {
    const command = cmd as any;
    commands.push({
      name,
      aliases: command.aliases || [],
      helpString: command.helpString,
    });
  }

  return { commands };
}

/**
 * 执行斜杠指令
 *
 * @example
 * await executeSlashCommand({ command: '/echo Hello World' })
 * await executeSlashCommand({ command: '/setvar key=name value | /echo {{getvar::name}}' })
 * await executeSlashCommand({ command: '/echo Hi', showOutput: true })
 */
export async function executeSlashCommand(input: ExecuteSlashCommandInput): Promise<ExecuteSlashCommandOutput> {
  const ctx = (window as any).SillyTavern?.getContext?.();

  if (!ctx) {
    return { ok: false, error: 'SillyTavern context not available' };
  }

  const execute = ctx.executeSlashCommandsWithOptions || ctx.executeSlashCommands;

  if (!execute) {
    return { ok: false, error: 'Slash command execution API not available' };
  }

  try {
    const result = await execute(input.command, {
      showOutput: input.showOutput ?? false,
    });

    // 提取管道结果
    let pipeResult: string | undefined;
    if (result === null || result === undefined) {
      pipeResult = '';
    } else if (typeof result === 'string') {
      pipeResult = result;
    } else if (typeof result === 'object' && 'pipe' in result) {
      pipeResult = String(result.pipe ?? '');
    } else {
      pipeResult = String(result);
    }

    return { ok: true, result: pipeResult };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
