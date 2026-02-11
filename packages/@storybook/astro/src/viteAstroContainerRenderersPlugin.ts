import type { Integration } from './integrations';

type PluginOptions = {
  mode?: 'development' | 'production';
  staticModuleMap?: Record<string, string>;
};

export function viteAstroContainerRenderersPlugin(
  integrations: Integration[],
  options: PluginOptions = {}
) {
  const name = 'astro-container-renderers';
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;
  const mode = options.mode ?? 'development';
  const staticModuleMap = options.staticModuleMap ?? {};

  return {
    name,

    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const importStatements = buildImportStatements(integrations);
        const clientResolvers =
          mode === 'development'
            ? integrations
                .filter((integration) => typeof integration.resolveClient === 'function')
                .map((integration) =>
                  integration.resolveClient.toString().replace(/^resolveClient/, 'function')
                )
                .join(',\n')
            : '';

        const code = `
          ${importStatements}
        
          export function addRenderers(container) {
            ${integrations.map((integration) => buildServerRenderer(integration) + '\n' + buildClientRenderer(integration)).join('\n')}
          }


          const staticClientModules = ${JSON.stringify(staticModuleMap, null, 2)};

          const clientModulesResolvers = [
            ${clientResolvers}
          ];
           
          export function resolveClientModules(s) {
            if (Object.hasOwn(staticClientModules, s)) {
              return staticClientModules[s];
            }

            const normalizedSpecifier = s.replace(/\\\\/g, '/').replace(/\\?.*$/, '');

            if (Object.hasOwn(staticClientModules, normalizedSpecifier)) {
              return staticClientModules[normalizedSpecifier];
            }

            for (const resolver of clientModulesResolvers) {
              const resolution = resolver(s);

              if (resolution) {
                return resolution;
              }
            }
          }
        `;

        return code;
      }
    }
  };
}

function buildImportStatements(integrations: Integration[]) {
  return integrations
    .filter((integration) => integration.renderer.server)
    .map(
      (integration) =>
        `import ${integration.name}Renderer from '${integration.renderer.server?.entrypoint}';`
    )
    .join('\n');
}

function buildServerRenderer(integration: Integration) {
  const serverRenderer = integration.renderer.server;

  if (!serverRenderer) {
    return '';
  }

  if (integration.name === 'solid') {
    return `
      container.addServerRenderer({
        name: '${serverRenderer.name}',
        renderer: {
          ...${integration.name}Renderer,
          name: '${serverRenderer.name}'
        }
      });
    `;
  }

  return `
    container.addServerRenderer({
      name: '${serverRenderer.name}',
      renderer: ${integration.name}Renderer
    });
  `;
}

function buildClientRenderer(integration: Integration) {
  const clientRenderer = integration.renderer.client;

  if (clientRenderer) {
    return `
      container.addClientRenderer({
        name: '${clientRenderer.name}',
        entrypoint: '${clientRenderer.entrypoint}'
      });
    `;
  }

  return '';
}
