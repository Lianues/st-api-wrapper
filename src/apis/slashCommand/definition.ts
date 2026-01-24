import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  RegisterSlashCommandInput,
  RegisterSlashCommandOutput,
  UnregisterSlashCommandInput,
  UnregisterSlashCommandOutput,
  ListSlashCommandsOutput,
  ExecuteSlashCommandInput,
  ExecuteSlashCommandOutput,
} from './types';
import {
  registerSlashCommand,
  unregisterSlashCommand,
  listSlashCommands,
  executeSlashCommand,
} from './impl';

const registerSlashCommandEndpoint: EndpointDefinition<
  RegisterSlashCommandInput,
  RegisterSlashCommandOutput
> = {
  name: 'register',
  handler: registerSlashCommand,
};

const unregisterSlashCommandEndpoint: EndpointDefinition<
  UnregisterSlashCommandInput,
  UnregisterSlashCommandOutput
> = {
  name: 'unregister',
  handler: unregisterSlashCommand,
};

const listSlashCommandsEndpoint: EndpointDefinition<void, ListSlashCommandsOutput> = {
  name: 'list',
  handler: listSlashCommands,
};

const executeSlashCommandEndpoint: EndpointDefinition<ExecuteSlashCommandInput, ExecuteSlashCommandOutput> = {
  name: 'execute',
  handler: executeSlashCommand,
};

export const slashCommandModuleDefinition: ApiModuleDefinition = {
  namespace: 'slashCommand',
  endpoints: [
    registerSlashCommandEndpoint,
    unregisterSlashCommandEndpoint,
    listSlashCommandsEndpoint,
    executeSlashCommandEndpoint,
  ],
};
