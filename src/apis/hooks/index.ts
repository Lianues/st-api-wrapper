import type { ApiRegistry } from '../../core/registry';
import { hooksModuleDefinition } from './definition';

export function registerHooksApis(registry: ApiRegistry) {
  registry.registerModule(hooksModuleDefinition);
}

