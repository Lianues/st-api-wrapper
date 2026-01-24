import type { ApiRegistry } from '../../core/registry';
import { variablesModuleDefinition } from './definition';

export function registerVariablesApis(registry: ApiRegistry) {
  registry.registerModule(variablesModuleDefinition);
}
