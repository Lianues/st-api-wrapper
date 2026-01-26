import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import * as impl from './impl';

const endpoints: EndpointDefinition<any, any>[] = [
  { name: 'list', handler: impl.list as any },
  { name: 'get', handler: impl.get as any },
  { name: 'add', handler: impl.add as any },
  { name: 'addZip', handler: impl.addZip as any },
  { name: 'addPath', handler: impl.addPath as any },
  { name: 'delete', handler: impl.deletePlugin as any },
  { name: 'restart', handler: impl.restart as any },
];

export const serverPluginModuleDefinition: ApiModuleDefinition = {
  namespace: 'serverPlugin',
  endpoints,
};

