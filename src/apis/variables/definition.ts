import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import * as impl from './impl';

const endpoints: EndpointDefinition<any, any>[] = [
  { name: 'get', handler: impl.get },
  { name: 'list', handler: impl.list as any },
  { name: 'set', handler: impl.set as any },
  { name: 'delete', handler: impl.deleteVariable as any },
  { name: 'add', handler: impl.add as any },
  { name: 'inc', handler: impl.inc as any },
  { name: 'dec', handler: impl.dec as any },
];

export const variablesModuleDefinition: ApiModuleDefinition = {
  namespace: 'variables',
  endpoints,
};
