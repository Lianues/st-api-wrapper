import type { ApiRegistry } from '../../core/registry';
import { fileModuleDefinition } from './definition';

export function registerFileApis(registry: ApiRegistry) {
  registry.registerModule(fileModuleDefinition);
}
