import { dirname, join } from 'node:path';
import type { StorybookConfigVite, FrameworkOptions, Integration } from './types';
import { vitePluginStorybookAstroMiddleware } from './viteStorybookAstroMiddlewarePlugin';
import { mergeWithAstroConfig } from './vitePluginAstro';

const getAbsolutePath = <I extends string>(input: I): I =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dirname(require.resolve(join(input, 'package.json'))) as any;

export const core = {
  builder: getAbsolutePath('@storybook/builder-vite'),
  renderer: getAbsolutePath('@storybook/astro-renderer')
};

export const viteFinal: StorybookConfigVite['viteFinal'] = async (config, { presets }) => {
  const options = await presets.apply<FrameworkOptions>('frameworkOptions');
  const { vitePlugin: storybookAstroMiddlewarePlugin, viteConfig } =
    await vitePluginStorybookAstroMiddleware(options);

  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push(
    storybookAstroMiddlewarePlugin,
    storybookRenderersPlugin(options.integrations),
    ...viteConfig.plugins
  );

  const finalConfig = await mergeWithAstroConfig(config, options.integrations);

  return finalConfig;
};

function storybookRenderersPlugin(integrations: Integration[]) {
  const virtualModuleId = 'virtual:storybook-renderers';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'virtual-module-plugin',

    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return integrations
          .filter((integration) => integration.storybookEntryPreview)
          .map((integration) => `export * as ${integration.name} from '${integration.storybookEntryPreview}';`)
          .join('\n');
      }
    }
  };
}
