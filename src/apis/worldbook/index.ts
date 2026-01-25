import type { ApiRegistry } from '../../core/registry';
import { worldBookModuleDefinition } from './definition';

export function registerWorldBookApis(registry: ApiRegistry) {
  registry.registerModule(worldBookModuleDefinition);
}
