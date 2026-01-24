import type { ApiRegistry } from '../../core/registry';
import { presetModuleDefinition } from './definition';

export function registerPresetApis(registry: ApiRegistry) {
  registry.registerModule(presetModuleDefinition);
}
