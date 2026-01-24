import type { ApiRegistry } from '../../core/registry';
import { regexScriptModuleDefinition } from './definition';

export function registerRegexScriptApis(registry: ApiRegistry) {
  registry.registerModule(regexScriptModuleDefinition);
}
