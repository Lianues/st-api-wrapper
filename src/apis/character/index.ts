import type { ApiRegistry } from '../../core/registry';
import { characterModuleDefinition } from './definition';

export function registerCharacterApis(registry: ApiRegistry) {
  registry.registerModule(characterModuleDefinition);
}

