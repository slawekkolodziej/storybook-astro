import type { Plugin } from 'vite';
import type { MswOptions } from '../msw-options.ts';
import { resolveMswConfigFilePath } from '../msw-options.ts';
import { createVirtualModulePlugin } from './createVirtualModulePlugin.ts';

export const STORYBOOK_ASTRO_MSW_CONFIG_VIRTUAL_MODULE_ID = 'virtual:storybook-astro-msw-config';

export function storybookAstroMswConfigVirtualModulePlugin(options?: MswOptions): Plugin {
  const pluginName = 'storybook-astro:virtual-msw-config';

  return createVirtualModulePlugin({
    pluginName,
    virtualModuleId: STORYBOOK_ASTRO_MSW_CONFIG_VIRTUAL_MODULE_ID,
    load() {
      const configFilePath = resolveMswConfigFilePath(options);

      if (!configFilePath) {
        return 'export default undefined;';
      }

      const importPath = JSON.stringify(configFilePath.replace(/\\/g, '/'));

      return [
        `import * as storybookMswConfigModule from ${importPath};`,
        'export default storybookMswConfigModule;'
      ].join('\n');
    }
  });
}
