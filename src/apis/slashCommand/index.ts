import type { ApiRegistry } from '../../core/registry';
import { slashCommandModuleDefinition } from './definition';

export function registerSlashCommandApis(registry: ApiRegistry) {
  registry.registerModule(slashCommandModuleDefinition);
}
