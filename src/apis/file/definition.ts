import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type { UploadInput, UploadOutput, GetInput, GetOutput, ListInput, ListOutput, DeleteInput, DeleteOutput } from './types';
import { upload, get, list, deleteFile } from './impl';

const uploadEndpoint: EndpointDefinition<UploadInput, UploadOutput> = {
  name: 'upload',
  handler: upload,
};

const getEndpoint: EndpointDefinition<GetInput, GetOutput> = {
  name: 'get',
  handler: get,
};

const listEndpoint: EndpointDefinition<ListInput, ListOutput> = {
  name: 'list',
  handler: list,
};

const deleteEndpoint: EndpointDefinition<DeleteInput, DeleteOutput> = {
  name: 'delete',
  handler: deleteFile,
};

export const fileModuleDefinition: ApiModuleDefinition = {
  namespace: 'file',
  endpoints: [uploadEndpoint, getEndpoint, listEndpoint, deleteEndpoint],
};
