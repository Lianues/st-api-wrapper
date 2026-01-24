import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  ListSettingsPanelsInput,
  ListSettingsPanelsOutput,
  RegisterExtensionsMenuItemInput,
  RegisterExtensionsMenuItemOutput,
  RegisterOptionsMenuItemInput,
  RegisterOptionsMenuItemOutput,
  RegisterSettingsPanelInput,
  RegisterSettingsPanelOutput,
  ReloadChatOutput,
  ReloadSettingsOutput,
  UnregisterSettingsPanelInput,
  UnregisterSettingsPanelOutput,
  RegisterTopSettingsDrawerInput,
  RegisterTopSettingsDrawerOutput,
  UnregisterTopSettingsDrawerInput,
  UnregisterTopSettingsDrawerOutput,
} from './types';
import {
  listSettingsPanels,
  registerExtensionsMenuItem,
  registerOptionsMenuItem,
  registerSettingsPanel,
  reloadChat,
  reloadSettings,
  unregisterSettingsPanel,
  registerTopSettingsDrawer,
  unregisterTopSettingsDrawer,
} from './impl';

const registerSettingsPanelEndpoint: EndpointDefinition<RegisterSettingsPanelInput, RegisterSettingsPanelOutput> = {
  name: 'registerSettingsPanel',
  handler: registerSettingsPanel,
};

const unregisterSettingsPanelEndpoint: EndpointDefinition<UnregisterSettingsPanelInput, UnregisterSettingsPanelOutput> = {
  name: 'unregisterSettingsPanel',
  handler: unregisterSettingsPanel,
};

const listSettingsPanelsEndpoint: EndpointDefinition<ListSettingsPanelsInput, ListSettingsPanelsOutput> = {
  name: 'listSettingsPanels',
  handler: listSettingsPanels,
};

const registerExtensionsMenuItemEndpoint: EndpointDefinition<
  RegisterExtensionsMenuItemInput,
  RegisterExtensionsMenuItemOutput
> = {
  name: 'registerExtensionsMenuItem',
  handler: registerExtensionsMenuItem,
};

const registerOptionsMenuItemEndpoint: EndpointDefinition<
  RegisterOptionsMenuItemInput,
  RegisterOptionsMenuItemOutput
> = {
  name: 'registerOptionsMenuItem',
  handler: registerOptionsMenuItem,
};

const reloadChatEndpoint: EndpointDefinition<void, ReloadChatOutput> = {
  name: 'reloadChat',
  handler: reloadChat,
};

const reloadSettingsEndpoint: EndpointDefinition<void, ReloadSettingsOutput> = {
  name: 'reloadSettings',
  handler: reloadSettings,
};

const registerTopSettingsDrawerEndpoint: EndpointDefinition<
  RegisterTopSettingsDrawerInput,
  RegisterTopSettingsDrawerOutput
> = {
  name: 'registerTopSettingsDrawer',
  handler: registerTopSettingsDrawer,
};

const unregisterTopSettingsDrawerEndpoint: EndpointDefinition<
  UnregisterTopSettingsDrawerInput,
  UnregisterTopSettingsDrawerOutput
> = {
  name: 'unregisterTopSettingsDrawer',
  handler: unregisterTopSettingsDrawer,
};

export const uiModuleDefinition: ApiModuleDefinition = {
  namespace: 'ui',
  endpoints: [
    registerSettingsPanelEndpoint,
    unregisterSettingsPanelEndpoint,
    listSettingsPanelsEndpoint,
    registerExtensionsMenuItemEndpoint,
    registerOptionsMenuItemEndpoint,
    reloadChatEndpoint,
    reloadSettingsEndpoint,
    registerTopSettingsDrawerEndpoint,
    unregisterTopSettingsDrawerEndpoint,
  ],
};
