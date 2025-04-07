import type { Integration } from './integrations';

export function viteAstroContainerRenderersPlugin(integrations: Integration[]) {
  const name = 'astro-container-renderers';
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
        const importStatements = buildImportStatements(integrations);

        const code = `
          ${importStatements}
          export function addRenderers(container) {
            ${integrations.map((integration) => buildServerRenderer(integration) + '\n' + buildClientRenderer(integration)).join('\n')}
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
