import type { ApiRegistry } from '../../core/registry';
import { macrosModuleDefinition } from './definition';

export function registerMacrosApis(registry: ApiRegistry) {
  registry.registerModule(macrosModuleDefinition);
}

