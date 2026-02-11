import pkgJson from '../package.json';
import { createVirtualModulePlugin } from './vite/createVirtualModulePlugin';

export function viteStorybookAstroRendererPlugin(options: { mode: 'development' | 'production' }) {
  const pluginName = 'storybook-astro:renderer-module';
  const virtualModuleId = 'virtual:storybook-astro-renderer';
  const isProduction = options.mode === 'production';

  return createVirtualModulePlugin({
    pluginName,
    virtualModuleId,
    load() {
      return `export * from '${pkgJson.name}/renderer/renderer${isProduction ? '' : '-dev'}.ts';`;
    }
  });
}
