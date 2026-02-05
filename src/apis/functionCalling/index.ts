import type { ApiRegistry } from '../../core/registry';
import { functionCallingModuleDefinition } from './definition';

export function registerFunctionCallingApis(registry: ApiRegistry) {
  registry.registerModule(functionCallingModuleDefinition);
}
