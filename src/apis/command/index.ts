import type { ApiRegistry } from '../../core/registry';
import { commandModuleDefinition } from './definition';

export function registerCommandApis(registry: ApiRegistry) {
  registry.registerModule(commandModuleDefinition);
}

