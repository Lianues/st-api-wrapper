import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type { GetInput, GetOutput, ListInput, ListOutput, CreateInput, CreateOutput, UpdateInput, UpdateOutput, DeleteInput, DeleteOutput } from './types';
import { get, list, create, update, deleteMessage } from './impl';

const getEndpoint: EndpointDefinition<GetInput, GetOutput> = {
  name: 'get',
  handler: get,
};

const listEndpoint: EndpointDefinition<ListInput, ListOutput> = {
  name: 'list',
  handler: list,
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
  handler: deleteMessage,
};

export const chatHistoryModuleDefinition: ApiModuleDefinition = {
  namespace: 'chatHistory',
  endpoints: [getEndpoint, listEndpoint, createEndpoint, updateEndpoint, deleteEndpoint],
};
