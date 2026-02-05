import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  GetFunctionToolInput,
  GetFunctionToolOutput,
  InvokeFunctionToolInput,
  InvokeFunctionToolOutput,
  IsSupportedOutput,
  ListFunctionToolsInput,
  ListFunctionToolsOutput,
  RegisterFunctionToolInput,
  RegisterFunctionToolOutput,
  SetEnabledInput,
  SetEnabledOutput,
  UnregisterFunctionToolInput,
  UnregisterFunctionToolOutput,
} from './types';
import * as impl from './impl';

const isSupportedEndpoint: EndpointDefinition<void, IsSupportedOutput> = {
  name: 'isSupported',
  handler: impl.isSupported,
};

const setEnabledEndpoint: EndpointDefinition<SetEnabledInput, SetEnabledOutput> = {
  name: 'setEnabled',
  handler: impl.setEnabled,
};

const registerEndpoint: EndpointDefinition<RegisterFunctionToolInput, RegisterFunctionToolOutput> = {
  name: 'register',
  handler: impl.register,
};

const unregisterEndpoint: EndpointDefinition<UnregisterFunctionToolInput, UnregisterFunctionToolOutput> = {
  name: 'unregister',
  handler: impl.unregister,
};

const listEndpoint: EndpointDefinition<ListFunctionToolsInput | void, ListFunctionToolsOutput> = {
  name: 'list',
  handler: impl.list as any,
};

const getEndpoint: EndpointDefinition<GetFunctionToolInput, GetFunctionToolOutput> = {
  name: 'get',
  handler: impl.get,
};

const invokeEndpoint: EndpointDefinition<InvokeFunctionToolInput, InvokeFunctionToolOutput> = {
  name: 'invoke',
  handler: impl.invoke,
};

export const functionCallingModuleDefinition: ApiModuleDefinition = {
  namespace: 'functionCalling',
  endpoints: [
    isSupportedEndpoint,
    setEnabledEndpoint,
    registerEndpoint,
    unregisterEndpoint,
    listEndpoint,
    getEndpoint,
    invokeEndpoint,
  ],
};
