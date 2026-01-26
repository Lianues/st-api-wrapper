import type { ApiRegistry } from '../core/registry';
import { registerPromptApis } from './prompt';
import { registerFileApis } from './file';
import { registerUiApis } from './ui';
import { registerHooksApis } from './hooks';
import { registerChatHistoryApis } from './chatHistory';
import { registerPresetApis } from './preset';
import { registerWorldBookApis } from './worldBook';
import { registerVariablesApis } from './variables';
import { registerRegexScriptApis } from './regexScript';
import { registerCharacterApis } from './character';
import { registerSlashCommandApis } from './slashCommand';
import { registerAvatarApis } from './avatar';
import { registerCommandApis } from './command';
import { registerServerPluginApis } from './serverPlugin';
import { registerServerApiApis } from './serverApi';

export function registerAllApis(registry: ApiRegistry) {
  registerPromptApis(registry);
  registerFileApis(registry);
  registerUiApis(registry);
  registerHooksApis(registry);
  registerChatHistoryApis(registry);
  registerPresetApis(registry);
  registerWorldBookApis(registry);
  registerVariablesApis(registry);
  registerRegexScriptApis(registry);
  registerCharacterApis(registry);
  registerSlashCommandApis(registry);
  registerAvatarApis(registry);
  registerCommandApis(registry);
  registerServerPluginApis(registry);
  registerServerApiApis(registry);
}
