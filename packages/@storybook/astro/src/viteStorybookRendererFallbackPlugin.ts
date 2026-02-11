import type { Integration } from './integrations';
import { createVirtualModulePlugin } from './vite/createVirtualModulePlugin';

export function viteStorybookRendererFallbackPlugin(integrations: Integration[]) {
  const pluginName = 'storybook-astro:renderer-fallback';
  const virtualModuleId = 'virtual:storybook-renderer-fallback';

  return createVirtualModulePlugin({
    pluginName,
    virtualModuleId,
    load() {
      return integrations
        .filter((integration) => integration.storybookEntryPreview)
        .map(
          (integration) =>
            `export * as ${integration.name} from '${integration.storybookEntryPreview}';`
        )
        .join('\n');
    }
  });
}
