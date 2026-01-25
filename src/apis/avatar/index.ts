import type { ApiRegistry } from '../../core/registry';
import { avatarModuleDefinition } from './definition';

export function registerAvatarApis(registry: ApiRegistry) {
  registry.registerModule(avatarModuleDefinition);
}

export * from './types';
export * from './impl';
export { avatarModuleDefinition } from './definition';
