import pkgJson from '../package.json';

export function viteStorybookAstroRendererPlugin(options: { mode: 'development' | 'production' }) {
  const name = 'storybook-astro-renderer';
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name,

    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const isProduction = options.mode === 'production';

        return {
          code: `export * from '${pkgJson.name}/renderer/renderer${isProduction ? '' : '-dev'}.ts';`
        };
      }
    }
  };
}
