import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type { BuildRequestInput, BuildRequestOutput, GetPromptInput, GetPromptOutput } from './types';
import { buildRequest, get } from './impl';

const getEndpoint: EndpointDefinition<GetPromptInput, GetPromptOutput> = {
  name: 'get',
  handler: get,
};

const buildRequestEndpoint: EndpointDefinition<BuildRequestInput, BuildRequestOutput> = {
  name: 'buildRequest',
  handler: buildRequest,
};

export const promptModuleDefinition: ApiModuleDefinition = {
  namespace: 'prompt',
  endpoints: [getEndpoint, buildRequestEndpoint],
};
