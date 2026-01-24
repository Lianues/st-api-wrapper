import type { ApiRegistry } from '../../core/registry';
import { promptModuleDefinition } from './definition';

export function registerPromptApis(registry: ApiRegistry) {
  registry.registerModule(promptModuleDefinition);
}
