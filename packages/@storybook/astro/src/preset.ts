import { dirname, join } from 'node:path';
import type { StorybookConfigVite, FrameworkOptions } from './types';
import { createStorybookAstroMiddlewarePlugin } from './viteStorybookAstroMiddlewarePlugin';
import { viteStorybookRendererFallbackPlugin } from './viteStorybookRendererFallbackPlugin';
import { mergeWithAstroConfig } from './vitePluginAstro';
import { viteStorybookAstroRendererPlugin } from './viteStorybookAstroRendererPlugin';
import { astroServerRenderPlugin } from './vite/astroServerRenderPlugin';

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

  config.envPrefix = mergeEnvPrefixes(config.envPrefix, 'STORYBOOK_');

  config.plugins.push(
    viteStorybookRendererFallbackPlugin(options.integrations),
    viteStorybookAstroRendererPlugin({
      mode: configType === 'DEVELOPMENT' ? 'development' : 'production'
    })
  );

  /** Start Astro dev middleware only when running storybook in DEVELOPMENT mode */
  if (configType === 'DEVELOPMENT') {
    const { vitePlugin: storybookAstroMiddlewarePlugin, viteConfig } =
      await createStorybookAstroMiddlewarePlugin(options);

    config.plugins.push(storybookAstroMiddlewarePlugin, ...viteConfig.plugins);

    const finalConfig = await mergeWithAstroConfig(
      config,
      options.integrations,
      'development',
      'serve'
    );

    return finalConfig;
  }

  config.build = {
    ...(config.build ?? {}),
    manifest: true
  };

  config.build.rollupOptions = {
    ...(config.build.rollupOptions ?? {}),
    preserveEntrySignatures: 'strict'
  };

  const outDir = config.build.outDir ? dirname(config.build.outDir) : process.cwd();

  config.plugins.push(
    ...astroServerRenderPlugin({
      integrations: options.integrations,
      outDir: join(outDir, 'storybook-server')
    })
  );

  const finalConfig = await mergeWithAstroConfig(
    config,
    options.integrations,
    'production',
    'build'
  );

  return finalConfig;
};

function mergeEnvPrefixes(
  existing: string | string[] | undefined,
  additionalPrefix: string
): string[] {
  const prefixes = Array.isArray(existing) ? existing : existing ? [existing] : [];

  return Array.from(new Set([...prefixes, additionalPrefix]));
}
