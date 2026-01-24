import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type { BuildRequestInput, BuildRequestOutput, GenerateInput, GenerateOutput, GetPromptInput, GetPromptOutput } from './types';
import { buildRequest, generate, get } from './impl';

const getEndpoint: EndpointDefinition<GetPromptInput, GetPromptOutput> = {
  name: 'get',
  handler: get,
};

const buildRequestEndpoint: EndpointDefinition<BuildRequestInput, BuildRequestOutput> = {
  name: 'buildRequest',
  handler: buildRequest,
};

const generateEndpoint: EndpointDefinition<GenerateInput, GenerateOutput> = {
  name: 'generate',
  handler: generate,
};

export const promptModuleDefinition: ApiModuleDefinition = {
  namespace: 'prompt',
  endpoints: [getEndpoint, buildRequestEndpoint, generateEndpoint],
};
