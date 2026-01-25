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
  ScrollChatInput,
  ScrollChatOutput,
  RegisterMessageButtonInput,
  RegisterMessageButtonOutput,
  UnregisterMessageButtonInput,
  UnregisterMessageButtonOutput,
  RegisterExtraMessageButtonInput,
  RegisterExtraMessageButtonOutput,
  UnregisterExtraMessageButtonInput,
  UnregisterExtraMessageButtonOutput,
  RegisterMessageHeaderElementInput,
  RegisterMessageHeaderElementOutput,
  UnregisterMessageHeaderElementInput,
  UnregisterMessageHeaderElementOutput,
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
  scrollChat,
  registerMessageButton,
  unregisterMessageButton,
  registerExtraMessageButton,
  unregisterExtraMessageButton,
  registerMessageHeaderElement,
  unregisterMessageHeaderElement,
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

const scrollChatEndpoint: EndpointDefinition<ScrollChatInput, ScrollChatOutput> = {
  name: 'scrollChat',
  handler: scrollChat,
};

const registerMessageButtonEndpoint: EndpointDefinition<
  RegisterMessageButtonInput,
  RegisterMessageButtonOutput
> = {
  name: 'registerMessageButton',
  handler: registerMessageButton,
};

const unregisterMessageButtonEndpoint: EndpointDefinition<
  UnregisterMessageButtonInput,
  UnregisterMessageButtonOutput
> = {
  name: 'unregisterMessageButton',
  handler: unregisterMessageButton,
};

const registerExtraMessageButtonEndpoint: EndpointDefinition<
  RegisterExtraMessageButtonInput,
  RegisterExtraMessageButtonOutput
> = {
  name: 'registerExtraMessageButton',
  handler: registerExtraMessageButton,
};

const unregisterExtraMessageButtonEndpoint: EndpointDefinition<
  UnregisterExtraMessageButtonInput,
  UnregisterExtraMessageButtonOutput
> = {
  name: 'unregisterExtraMessageButton',
  handler: unregisterExtraMessageButton,
};

const registerMessageHeaderElementEndpoint: EndpointDefinition<
  RegisterMessageHeaderElementInput,
  RegisterMessageHeaderElementOutput
> = {
  name: 'registerMessageHeaderElement',
  handler: registerMessageHeaderElement,
};

const unregisterMessageHeaderElementEndpoint: EndpointDefinition<
  UnregisterMessageHeaderElementInput,
  UnregisterMessageHeaderElementOutput
> = {
  name: 'unregisterMessageHeaderElement',
  handler: unregisterMessageHeaderElement,
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
    scrollChatEndpoint,
    registerMessageButtonEndpoint,
    unregisterMessageButtonEndpoint,
    registerExtraMessageButtonEndpoint,
    unregisterExtraMessageButtonEndpoint,
    registerMessageHeaderElementEndpoint,
    unregisterMessageHeaderElementEndpoint,
  ],
};
