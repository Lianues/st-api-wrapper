import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  RegisterMacroInput,
  RegisterMacroOutput,
  UnregisterMacroInput,
  UnregisterMacroOutput,
  ListMacrosInput,
  ListMacrosOutput,
  ProcessMacrosInput,
  ProcessMacrosOutput,
} from './types';
import * as impl from './impl';

const registerEndpoint: EndpointDefinition<RegisterMacroInput, RegisterMacroOutput> = {
  name: 'register',
  handler: impl.register,
};

const unregisterEndpoint: EndpointDefinition<UnregisterMacroInput, UnregisterMacroOutput> = {
  name: 'unregister',
  handler: impl.unregister,
};

const listEndpoint: EndpointDefinition<ListMacrosInput | void, ListMacrosOutput> = {
  name: 'list',
  handler: impl.list as any,
};

const processEndpoint: EndpointDefinition<ProcessMacrosInput, ProcessMacrosOutput> = {
  name: 'process',
  handler: impl.process,
};

export const macrosModuleDefinition: ApiModuleDefinition = {
  namespace: 'macros',
  endpoints: [registerEndpoint, unregisterEndpoint, listEndpoint, processEndpoint],
};

