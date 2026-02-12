import type { Plugin } from 'vite';
import type { RulesOptions } from '../rules-options.ts';
import { resolveRulesConfigFilePath } from '../rules-options.ts';
import { createVirtualModulePlugin } from './createVirtualModulePlugin.ts';

export const STORYBOOK_ASTRO_RULES_CONFIG_VIRTUAL_MODULE_ID =
  'virtual:storybook-astro-rules-config';

export function storybookAstroRulesConfigVirtualModulePlugin(options?: RulesOptions): Plugin {
  const pluginName = 'storybook-astro:virtual-rules-config';

  return createVirtualModulePlugin({
    pluginName,
    virtualModuleId: STORYBOOK_ASTRO_RULES_CONFIG_VIRTUAL_MODULE_ID,
    load() {
      const configFilePath = resolveRulesConfigFilePath(options);

      if (!configFilePath) {
        return [
          'const storybookAstroRulesConfig = { rules: [] };',
          'export default storybookAstroRulesConfig;',
          'export const storybookAstroRulesConfigFilePath = undefined;'
        ].join('\n');
      }

      const importPath = JSON.stringify(configFilePath.replace(/\\/g, '/'));
      const configPath = JSON.stringify(configFilePath.replace(/\\/g, '/'));

      return [
        `import * as storybookAstroRulesConfigModule from ${importPath};`,
        'export default storybookAstroRulesConfigModule;',
        `export const storybookAstroRulesConfigFilePath = ${configPath};`
      ].join('\n');
    }
  });
}
