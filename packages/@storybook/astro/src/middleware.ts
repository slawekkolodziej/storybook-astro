import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { Integration } from './integrations';
import type { $FIXME } from './types';

type ViteLoadModuleFn = (modulePath: string) => Promise<Record<string, unknown>>;

export async function handlerFactory(integrations: Integration[], loadModule: ViteLoadModuleFn) {
  const container = await AstroContainer.create({
    // Somewhat hacky way to force client-side Storybook's Vite to resolve modules properly
    resolve: async (s) => {
      if (s.startsWith('astro:scripts')) {
        return `/@id/${s}`;
      }

      for (const integration of integrations) {
        const resolution = integration.resolveClient(s);

        if (resolution) {
          return resolution;
        }
      }

      return s;
    }
  });

  await Promise.all(
    integrations.map(async (integration) => {
      if (integration.renderer.server) {
        const renderer = await loadModule(integration.renderer.server.entrypoint);

        container.addServerRenderer({
          name: integration.renderer.server.name,
          renderer:
            integration.name === 'solid'
              ? // Solid needs special handling
                {
                  ...(renderer.default as $FIXME),
                  name: integration.renderer.server.name
                }
              : renderer.default
        });
      }

      if (integration.renderer.client) {
        container.addClientRenderer(integration.renderer.client);
      }
    })
  );

  type HandlerProps = {
    component: string;
    args?: Record<string, unknown>;
    slots?: Record<string, unknown>;
  };

  return async function handler(data: HandlerProps) {
    const { default: Component } = await import(/* @vite-ignore */ data.component);

    return container.renderToString(Component, {
      props: data.args,
      slots: data.slots ?? {}
    });
  };
}
