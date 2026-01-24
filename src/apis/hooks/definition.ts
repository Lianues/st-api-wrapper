import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  BypassOnceInput,
  BypassOnceOutput,
  InstallHooksInput,
  InstallHooksOutput,
  UninstallHooksInput,
  UninstallHooksOutput,
} from './types';
import { bypassOnce, install, uninstall } from './impl';

const installEndpoint: EndpointDefinition<InstallHooksInput, InstallHooksOutput> = {
  name: 'install',
  handler: install,
};

const uninstallEndpoint: EndpointDefinition<UninstallHooksInput, UninstallHooksOutput> = {
  name: 'uninstall',
  handler: uninstall,
};

const bypassOnceEndpoint: EndpointDefinition<BypassOnceInput, BypassOnceOutput> = {
  name: 'bypassOnce',
  handler: bypassOnce,
};

export const hooksModuleDefinition: ApiModuleDefinition = {
  namespace: 'hooks',
  endpoints: [installEndpoint, uninstallEndpoint, bypassOnceEndpoint],
};

