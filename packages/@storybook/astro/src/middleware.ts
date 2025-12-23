import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { Integration } from './integrations.ts';
import { addRenderers } from 'virtual:astro-container-renderers';

export type HandlerProps = {
  component: string;
  args?: Record<string, unknown>;
  slots?: Record<string, unknown>;
};

export async function handlerFactory(integrations: Integration[]) {
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

  addRenderers(container);

  return async function handler(data: HandlerProps) {
    const { default: Component } = await import(/* @vite-ignore */ data.component);

    return container.renderToString(Component, {
      props: data.args,
      slots: data.slots ?? {}
    });
  };
}
