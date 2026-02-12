import { dirname, join } from 'node:path';
import type { StorybookConfigVite, FrameworkOptions } from './types.ts';
import { createStorybookAstroMiddlewarePlugin } from './viteStorybookAstroMiddlewarePlugin.ts';
import { viteStorybookRendererFallbackPlugin } from './viteStorybookRendererFallbackPlugin.ts';
import { mergeWithAstroConfig } from './vitePluginAstro.ts';
import { viteStorybookAstroRendererPlugin } from './viteStorybookAstroRendererPlugin.ts';
import { astroServerRenderPlugin } from './vite/astroServerRenderPlugin.ts';

export const core = {
  builder: '@storybook/builder-vite',
  renderer: '@astrostory/renderer'
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

  if (!config.resolve) {
    config.resolve = {};
  }

  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }

  const aliases = config.resolve.alias as Record<string, string>;

  aliases.react ??= 'react';
  aliases['react-dom'] ??= 'react-dom';

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
      msw: options.msw,
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
