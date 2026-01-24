import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type { 
  GetInput, GetOutput,
  ListInput, ListOutput,
  ProcessInput, ProcessOutput, 
  RunInput,
  CreateInput, CreateOutput,
  UpdateInput, UpdateOutput,
  DeleteInput, DeleteOutput
} from './types';
import { get, list, process, run, create, update, deleteScript } from './impl';

const getEndpoint: EndpointDefinition<GetInput, GetOutput> = {
  name: 'get',
  handler: get,
};

const listEndpoint: EndpointDefinition<ListInput, ListOutput> = {
  name: 'list',
  handler: list,
};

const processEndpoint: EndpointDefinition<ProcessInput, ProcessOutput> = {
  name: 'process',
  handler: process,
};

const runEndpoint: EndpointDefinition<RunInput, ProcessOutput> = {
  name: 'run',
  handler: run,
};

const createEndpoint: EndpointDefinition<CreateInput, CreateOutput> = {
  name: 'create',
  handler: create,
};

const updateEndpoint: EndpointDefinition<UpdateInput, UpdateOutput> = {
  name: 'update',
  handler: update,
};

const deleteEndpoint: EndpointDefinition<DeleteInput, DeleteOutput> = {
  name: 'delete',
  handler: deleteScript,
};

export const regexScriptModuleDefinition: ApiModuleDefinition = {
  namespace: 'regexScript',
  endpoints: [getEndpoint, listEndpoint, processEndpoint, runEndpoint, createEndpoint, updateEndpoint, deleteEndpoint],
};
