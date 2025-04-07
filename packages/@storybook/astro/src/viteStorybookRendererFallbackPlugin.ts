import type { Integration } from './integrations';

export function viteStorybookRendererFallbackPlugin(integrations: Integration[]) {
  const name = 'storybook-renderer-fallback';
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
        return integrations
          .filter((integration) => integration.storybookEntryPreview)
          .map(
            (integration) =>
              `export * as ${integration.name} from '${integration.storybookEntryPreview}';`
          )
          .join('\n');
      }
    }
  };
}
