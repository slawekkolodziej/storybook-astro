import { createVirtualModulePlugin } from './vite/createVirtualModulePlugin.ts';
import type { RenderMode } from './types.ts';

const packageName = '@astrostory/core';

export function viteStorybookAstroRendererPlugin(options: {
  mode: 'development' | 'production';
  renderMode?: RenderMode;
}) {
  const pluginName = 'storybook-astro:renderer-module';
  const virtualModuleId = 'virtual:storybook-astro-renderer';
  const isProduction = options.mode === 'production';
  const isStaticMode = options.renderMode === 'static';

  return createVirtualModulePlugin({
    pluginName,
    virtualModuleId,
    load() {
      if (!isProduction) {
        return `export * from '${packageName}/renderer/renderer-dev.ts';`;
      }

      if (isStaticMode) {
        return `export * from '${packageName}/renderer/renderer-static.ts';`;
      }

      return `export * from '${packageName}/renderer/renderer.ts';`;
    }
  });
}
