import type { ApiRegistry } from '../../core/registry';
import { worldbookModuleDefinition } from './definition';

export function registerWorldBookApis(registry: ApiRegistry) {
  registry.registerModule(worldbookModuleDefinition);
}
