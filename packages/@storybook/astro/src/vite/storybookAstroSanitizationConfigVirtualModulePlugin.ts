import type { Plugin } from 'vite';
import type { SanitizationOptions } from '../sanitization.ts';
import { serializeSanitizationOptions } from '../sanitization.ts';
import { createVirtualModulePlugin } from './createVirtualModulePlugin.ts';

export const STORYBOOK_ASTRO_SANITIZATION_CONFIG_VIRTUAL_MODULE_ID =
  'virtual:storybook-astro-sanitization-config';

export function storybookAstroSanitizationConfigVirtualModulePlugin(
  options?: SanitizationOptions
): Plugin {
  const pluginName = 'storybook-astro:virtual-sanitization-config';

  return createVirtualModulePlugin({
    pluginName,
    virtualModuleId: STORYBOOK_ASTRO_SANITIZATION_CONFIG_VIRTUAL_MODULE_ID,
    load() {
      const serializedConfig = serializeSanitizationOptions(options);

      return `export default ${serializedConfig};`;
    }
  });
}
