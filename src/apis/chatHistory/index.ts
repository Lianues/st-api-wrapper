import type { ApiRegistry } from '../../core/registry';
import { chatHistoryModuleDefinition } from './definition';

export function registerChatHistoryApis(registry: ApiRegistry) {
  registry.registerModule(chatHistoryModuleDefinition);
}
