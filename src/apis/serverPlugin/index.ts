import type { ApiRegistry } from '../../core/registry';
import { serverPluginModuleDefinition } from './definition';

export function registerServerPluginApis(registry: ApiRegistry) {
  registry.registerModule(serverPluginModuleDefinition);
}

