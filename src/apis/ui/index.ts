import type { ApiRegistry } from '../../core/registry';
import { uiModuleDefinition } from './definition';

export function registerUiApis(registry: ApiRegistry) {
  registry.registerModule(uiModuleDefinition);
}
