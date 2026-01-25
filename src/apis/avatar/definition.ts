import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  GetAvatarInput,
  AvatarOutput,
  ListAvatarsInput,
  ListAvatarsOutput,
} from './types';
import { get, list } from './impl';

const getEndpoint: EndpointDefinition<GetAvatarInput, AvatarOutput> = {
  name: 'get',
  handler: get,
};

const listEndpoint: EndpointDefinition<ListAvatarsInput, ListAvatarsOutput> = {
  name: 'list',
  handler: list,
};

export const avatarModuleDefinition: ApiModuleDefinition = {
  namespace: 'avatar',
  endpoints: [getEndpoint, listEndpoint],
};
