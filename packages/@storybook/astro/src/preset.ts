import type { StorybookConfigVite, FrameworkOptions } from './types.ts';
import { vitePluginStorybookAstroMiddleware } from './viteStorybookAstroMiddlewarePlugin.ts';
import { viteStorybookRendererFallbackPlugin } from './viteStorybookRendererFallbackPlugin.ts';
import { mergeWithAstroConfig } from './vitePluginAstro.ts';

export const core = {
  builder: '@storybook/builder-vite',
  renderer: '@storybook/astro-renderer'
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
    viteStorybookRendererFallbackPlugin(options.integrations),
    ...viteConfig.plugins
  );

  const finalConfig = await mergeWithAstroConfig(config, options.integrations);

  return finalConfig;
};
