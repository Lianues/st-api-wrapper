import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  CreateWorldBookEntryInput,
  CreateWorldBookEntryOutput,
  CreateWorldBookInput,
  CreateWorldBookOutput,
  DeleteWorldBookEntryInput,
  DeleteWorldBookEntryOutput,
  DeleteWorldBookInput,
  DeleteWorldBookOutput,
  UpdateWorldBookInput,
  UpdateWorldBookOutput,
  GetWorldBookEntryInput,
  GetWorldBookEntryOutput,
  GetWorldBookInput,
  GetWorldBookOutput,
  ListWorldBooksInput,
  ListWorldBooksOutput,
  UpdateWorldBookEntryInput,
  UpdateWorldBookEntryOutput,
} from './types';
import {
  createWorldBook,
  createWorldBookEntry,
  deleteWorldBook,
  deleteWorldBookEntry,
  getWorldBook,
  getWorldBookEntry,
  listWorldBooks,
  updateWorldBook,
  updateWorldBookEntry,
} from './impl';

const listWorldBooksEndpoint: EndpointDefinition<ListWorldBooksInput, ListWorldBooksOutput> = {
  name: 'list',
  handler: listWorldBooks,
};

const getWorldBookEndpoint: EndpointDefinition<GetWorldBookInput, GetWorldBookOutput> = {
  name: 'get',
  handler: getWorldBook,
};

const getWorldBookEntryEndpoint: EndpointDefinition<GetWorldBookEntryInput, GetWorldBookEntryOutput> = {
  name: 'getEntry',
  handler: getWorldBookEntry,
};

const createWorldBookEndpoint: EndpointDefinition<CreateWorldBookInput, CreateWorldBookOutput> = {
  name: 'create',
  handler: createWorldBook,
};

const deleteWorldBookEndpoint: EndpointDefinition<DeleteWorldBookInput, DeleteWorldBookOutput> = {
  name: 'delete',
  handler: deleteWorldBook,
};

const updateWorldBookEndpoint: EndpointDefinition<UpdateWorldBookInput, UpdateWorldBookOutput> = {
  name: 'update',
  handler: updateWorldBook,
};

const createEntryEndpoint: EndpointDefinition<CreateWorldBookEntryInput, CreateWorldBookEntryOutput> = {
  name: 'createEntry',
  handler: createWorldBookEntry,
};

const updateEntryEndpoint: EndpointDefinition<UpdateWorldBookEntryInput, UpdateWorldBookEntryOutput> = {
  name: 'updateEntry',
  handler: updateWorldBookEntry,
};

const deleteEntryEndpoint: EndpointDefinition<DeleteWorldBookEntryInput, DeleteWorldBookEntryOutput> = {
  name: 'deleteEntry',
  handler: deleteWorldBookEntry,
};

export const worldBookModuleDefinition: ApiModuleDefinition = {
  namespace: 'worldBook',
  endpoints: [
    listWorldBooksEndpoint,
    getWorldBookEndpoint,
    getWorldBookEntryEndpoint,
    createWorldBookEndpoint,
    deleteWorldBookEndpoint,
    updateWorldBookEndpoint,
    createEntryEndpoint,
    updateEntryEndpoint,
    deleteEntryEndpoint,
  ],
};
