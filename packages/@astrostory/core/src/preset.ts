import { dirname, join } from 'node:path';
import type { StorybookConfigVite, FrameworkOptions } from './types.ts';
import { createStorybookAstroMiddlewarePlugin } from './viteStorybookAstroMiddlewarePlugin.ts';
import { viteStorybookRendererFallbackPlugin } from './viteStorybookRendererFallbackPlugin.ts';
import { mergeWithAstroConfig } from './vitePluginAstro.ts';
import { viteStorybookAstroRendererPlugin } from './viteStorybookAstroRendererPlugin.ts';
import { astroServerRenderPlugin } from './vite/astroServerRenderPlugin.ts';
import { astroStaticPrerenderPlugin } from './vite/astroStaticPrerenderPlugin.ts';
import { resolveSanitizationOptions } from './sanitization.ts';

export const core = {
  builder: '@storybook/builder-vite',
  renderer: '@astrostory/renderer'
};

export const viteFinal: StorybookConfigVite['viteFinal'] = async (
  config,
  { configType, presets }
) => {
  const options = await presets.apply<FrameworkOptions>('frameworkOptions');

  validateFrameworkOptions(options);

  resolveSanitizationOptions(options.sanitization);

  if (!config.plugins) {
    config.plugins = [];
  }

  config.envPrefix = mergeEnvPrefixes(config.envPrefix, 'STORYBOOK_');

  config.plugins.push(
    viteStorybookRendererFallbackPlugin(options.integrations),
    viteStorybookAstroRendererPlugin({
      mode: configType === 'DEVELOPMENT' ? 'development' : 'production',
      renderMode: options.renderMode
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

  if (options.renderMode === 'static') {
    const staticOutputDir = config.build.outDir ?? join(process.cwd(), 'storybook-static');

    config.plugins.push(
      ...astroStaticPrerenderPlugin({
        integrations: options.integrations,
        sanitization: options.sanitization,
        outDir: staticOutputDir
      })
    );
  } else {
    const outDir = config.build.outDir ? dirname(config.build.outDir) : process.cwd();

    config.plugins.push(
      ...astroServerRenderPlugin({
        integrations: options.integrations,
        sanitization: options.sanitization,
        storyRules: options.storyRules,
        outDir: join(outDir, 'storybook-server')
      })
    );
  }

  const finalConfig = await mergeWithAstroConfig(
    config,
    options.integrations,
    'production',
    'build'
  );

  return finalConfig;
};

function validateFrameworkOptions(options: FrameworkOptions) {
  if (options.renderMode === 'static' && options.storyRules !== undefined) {
    throw new Error(
      'framework.options.storyRules is not supported when framework.options.renderMode is "static".'
    );
  }
}

function mergeEnvPrefixes(
  existing: string | string[] | undefined,
  additionalPrefix: string
): string[] {
  const prefixes = Array.isArray(existing) ? existing : existing ? [existing] : [];

  return Array.from(new Set([...prefixes, additionalPrefix]));
}
