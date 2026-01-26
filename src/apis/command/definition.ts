import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import * as impl from './impl';

const endpoints: EndpointDefinition<any, any>[] = [
  { name: 'probe', handler: impl.probe as any },
  { name: 'env', handler: impl.env as any },
  { name: 'which', handler: impl.which as any },
  { name: 'run', handler: impl.run as any },
  { name: 'getSandbox', handler: impl.getSandbox as any },
  { name: 'setSandbox', handler: impl.setSandbox as any },
];

export const commandModuleDefinition: ApiModuleDefinition = {
  namespace: 'command',
  endpoints,
};

