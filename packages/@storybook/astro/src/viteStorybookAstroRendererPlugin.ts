import { createVirtualModulePlugin } from './vite/createVirtualModulePlugin.ts';

const packageName = '@storybook/astro';

export function viteStorybookAstroRendererPlugin(options: { mode: 'development' | 'production' }) {
  const pluginName = 'storybook-astro:renderer-module';
  const virtualModuleId = 'virtual:storybook-astro-renderer';
  const isProduction = options.mode === 'production';

  return createVirtualModulePlugin({
    pluginName,
    virtualModuleId,
    load() {
      return `export * from '${packageName}/renderer/renderer${isProduction ? '' : '-dev'}.ts';`;
    }
  });
}
