import type { RegexMacroMode, RegexScope, RegexScriptData, RegexTarget, RegexView } from './types';

const targetMap: Record<number, RegexTarget> = {
  1: 'userInput',
  2: 'aiOutput',
  3: 'slashCommands',
  5: 'worldBook',
  6: 'reasoning',
};

const reverseTargetMap: Record<string, number> = {
  userInput: 1,
  aiOutput: 2,
  slashCommands: 3,
  worldBook: 5,
  reasoning: 6,
};

const macroModeMap: Record<number, RegexMacroMode> = {
  0: 'none',
  1: 'raw',
  2: 'escaped',
};

const reverseMacroModeMap: Record<string, number> = {
  none: 0,
  raw: 1,
  escaped: 2,
};

export function fromStRegex(stRegex: any): RegexScriptData {
  const {
    id,
    scriptName,
    disabled,
    findRegex,
    replaceString,
    trimStrings,
    placement,
    markdownOnly,
    promptOnly,
    runOnEdit,
    substituteRegex,
    minDepth,
    maxDepth,
  } = stRegex ?? {};

  const targets = (Array.isArray(placement) ? placement : [])
    .map((p) => targetMap[p])
    .filter(Boolean) as RegexTarget[];

  const view: RegexView[] = [];
  if (markdownOnly) view.push('user');
  if (promptOnly) view.push('model');

  return {
    id: String(id ?? ''),
    name: String(scriptName || ''),
    enabled: !disabled,
    findRegex: String(findRegex || ''),
    replaceRegex: String(replaceString || ''),
    trimRegex: Array.isArray(trimStrings) ? trimStrings : [],
    targets,
    view,
    runOnEdit: !!runOnEdit,
    macroMode: macroModeMap[substituteRegex] || 'none',
    minDepth: minDepth ?? null,
    maxDepth: maxDepth ?? null,
  };
}

export function toStRegex(data: RegexScriptData): any {
  const placement = (Array.isArray(data?.targets) ? data.targets : [])
    .map((t) => reverseTargetMap[t])
    .filter(Boolean);

  const view = Array.isArray(data?.view) ? data.view : [];

  return {
    id: data.id,
    scriptName: data.name,
    disabled: !data.enabled,
    findRegex: data.findRegex,
    replaceString: data.replaceRegex,
    trimStrings: data.trimRegex,
    placement,
    markdownOnly: view.includes('user'),
    promptOnly: view.includes('model'),
    runOnEdit: data.runOnEdit,
    substituteRegex: reverseMacroModeMap[data.macroMode] ?? 0,
    minDepth: data.minDepth,
    maxDepth: data.maxDepth,
  };
}

/**
 * 获取作用域对应的 SCRIPT_TYPES 常量
 */
export function getScopeType(scope: RegexScope, SCRIPT_TYPES: any) {
  switch (scope) {
    case 'global': return SCRIPT_TYPES.GLOBAL;
    case 'character': return SCRIPT_TYPES.SCOPED;
    case 'preset': return SCRIPT_TYPES.PRESET;
    default: return SCRIPT_TYPES.GLOBAL;
  }
}

