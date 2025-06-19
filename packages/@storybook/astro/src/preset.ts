import { dirname, join } from 'node:path';
import type { StorybookConfigVite, FrameworkOptions } from './types';
import { vitePluginStorybookAstroMiddleware } from './viteStorybookAstroMiddlewarePlugin';
import { viteStorybookRendererFallbackPlugin } from './viteStorybookRendererFallbackPlugin';
import { mergeWithAstroConfig } from './vitePluginAstro';
import { viteStorybookAstroRendererPlugin } from './viteStorybookAstroRendererPlugin';

const getAbsolutePath = <I extends string>(input: I): I =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dirname(require.resolve(join(input, 'package.json'))) as any;

export const core = {
  builder: getAbsolutePath('@storybook/builder-vite'),
  renderer: getAbsolutePath('@storybook/astro-renderer')
};

export const viteFinal: StorybookConfigVite['viteFinal'] = async (
  config,
  { configType, presets }
) => {
  const options = await presets.apply<FrameworkOptions>('frameworkOptions');

  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push(
    viteStorybookRendererFallbackPlugin(options.integrations),
    viteStorybookAstroRendererPlugin({
      mode: configType === 'DEVELOPMENT' ? 'development' : 'production'
    })
  );

  /** Start Astro dev middleware only when running storybook in DEVELOPMENT mode */
  if (configType === 'DEVELOPMENT') {
    const { vitePlugin: storybookAstroMiddlewarePlugin, viteConfig } =
      await vitePluginStorybookAstroMiddleware(options);

    config.plugins.push(storybookAstroMiddlewarePlugin, ...viteConfig.plugins);

    const finalConfig = await mergeWithAstroConfig(
      config,
      options.integrations,
      'development',
      'serve'
    );

    return finalConfig;
  }

  config.plugins.push(...astroStaticRenderPlugin());

  const finalConfig = await mergeWithAstroConfig(
    config,
    options.integrations,
    'production',
    'build'
  );

  return finalConfig;
};

export function astroStaticRenderPlugin() {
  const storiesMap = new Map<string, Set<string>>();

  return [
  ] as const;
}
