import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  DeleteCharacterInput,
  DeleteCharacterOutput,
  GetCharacterInput,
  GetCharacterOutput,
  ListCharactersInput,
  ListCharactersOutput,
  UpdateCharacterInput,
  UpdateCharacterOutput,
} from './types';
import { deleteCharacter, get, list, update } from './impl';

const getEndpoint: EndpointDefinition<GetCharacterInput, GetCharacterOutput> = {
  name: 'get',
  handler: get,
};

const listEndpoint: EndpointDefinition<ListCharactersInput, ListCharactersOutput> = {
  name: 'list',
  handler: list,
};

const deleteEndpoint: EndpointDefinition<DeleteCharacterInput, DeleteCharacterOutput> = {
  name: 'delete',
  handler: deleteCharacter,
};

const updateEndpoint: EndpointDefinition<UpdateCharacterInput, UpdateCharacterOutput> = {
  name: 'update',
  handler: update,
};

export const characterModuleDefinition: ApiModuleDefinition = {
  namespace: 'character',
  endpoints: [getEndpoint, listEndpoint, deleteEndpoint, updateEndpoint],
};

