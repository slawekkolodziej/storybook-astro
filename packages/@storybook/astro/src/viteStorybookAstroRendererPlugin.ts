export function viteStorybookAstroRendererPlugin(options = { mode: 'development' }) {
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
          code: `export * from '@storybook/astro/renderer/renderer${isProduction ? '' : '-dev'}.ts';`
        };
      }
    }
  };
}
