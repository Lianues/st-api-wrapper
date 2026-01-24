import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type { 
  GetPresetInput, GetPresetOutput,
  ListPresetsOutput,
  CreatePresetInput, CreatePresetOutput, 
  UpdatePresetInput, UpdatePresetOutput, 
  DeletePresetInput, DeletePresetOutput,
  CreatePromptInput, CreatePromptOutput,
  UpdatePromptInput, UpdatePromptOutput,
  DeletePromptInput, DeletePromptOutput,
  GetPromptInput, GetPromptOutput
} from './types';
import { 
  get, list, create, update, deletePreset,
  createPrompt, updatePrompt, deletePrompt, getPrompt
} from './impl';

const getEndpoint: EndpointDefinition<GetPresetInput, GetPresetOutput> = {
  name: 'get',
  handler: get,
};

const listEndpoint: EndpointDefinition<void, ListPresetsOutput> = {
  name: 'list',
  handler: list,
};

const createEndpoint: EndpointDefinition<CreatePresetInput, CreatePresetOutput> = {
  name: 'create',
  handler: create,
};

const updateEndpoint: EndpointDefinition<UpdatePresetInput, UpdatePresetOutput> = {
  name: 'update',
  handler: update,
};

const deleteEndpoint: EndpointDefinition<DeletePresetInput, DeletePresetOutput> = {
  name: 'delete',
  handler: deletePreset,
};

const getPromptEndpoint: EndpointDefinition<GetPromptInput, GetPromptOutput> = {
  name: 'getPrompt',
  handler: getPrompt,
};

const createPromptEndpoint: EndpointDefinition<CreatePromptInput, CreatePromptOutput> = {
  name: 'createPrompt',
  handler: createPrompt,
};

const updatePromptEndpoint: EndpointDefinition<UpdatePromptInput, UpdatePromptOutput> = {
  name: 'updatePrompt',
  handler: updatePrompt,
};

const deletePromptEndpoint: EndpointDefinition<DeletePromptInput, DeletePromptOutput> = {
  name: 'deletePrompt',
  handler: deletePrompt,
};

export const presetModuleDefinition: ApiModuleDefinition = {
  namespace: 'preset',
  endpoints: [
    getEndpoint,
    listEndpoint,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    getPromptEndpoint, createPromptEndpoint, updatePromptEndpoint, deletePromptEndpoint
  ],
};
