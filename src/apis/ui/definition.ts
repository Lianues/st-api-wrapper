import type { ApiModuleDefinition, EndpointDefinition } from '../../core/registry';
import type {
  ListSettingsPanelsInput,
  ListSettingsPanelsOutput,
  RegisterExtensionsMenuItemInput,
  RegisterExtensionsMenuItemOutput,
  UnregisterExtensionsMenuItemInput,
  UnregisterExtensionsMenuItemOutput,
  RegisterOptionsMenuItemInput,
  RegisterOptionsMenuItemOutput,
  UnregisterOptionsMenuItemInput,
  UnregisterOptionsMenuItemOutput,
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
  unregisterExtensionsMenuItem,
  registerOptionsMenuItem,
  unregisterOptionsMenuItem,
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

const unregisterExtensionsMenuItemEndpoint: EndpointDefinition<
  UnregisterExtensionsMenuItemInput,
  UnregisterExtensionsMenuItemOutput
> = {
  name: 'unregisterExtensionsMenuItem',
  handler: unregisterExtensionsMenuItem,
};

const registerOptionsMenuItemEndpoint: EndpointDefinition<
  RegisterOptionsMenuItemInput,
  RegisterOptionsMenuItemOutput
> = {
  name: 'registerOptionsMenuItem',
  handler: registerOptionsMenuItem,
};

const unregisterOptionsMenuItemEndpoint: EndpointDefinition<
  UnregisterOptionsMenuItemInput,
  UnregisterOptionsMenuItemOutput
> = {
  name: 'unregisterOptionsMenuItem',
  handler: unregisterOptionsMenuItem,
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
    unregisterExtensionsMenuItemEndpoint,
    registerOptionsMenuItemEndpoint,
    unregisterOptionsMenuItemEndpoint,
    reloadChatEndpoint,
    reloadSettingsEndpoint,
    registerTopSettingsDrawerEndpoint,
    unregisterTopSettingsDrawerEndpoint,
  ],
};
