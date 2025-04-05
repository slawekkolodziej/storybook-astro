import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { SupportedFramework } from './types';

async function attachRenderers(container: AstroContainer, integrations: SupportedFramework[]) {
  if (integrations.includes('react')) {
    const { default: reactRenderer } = await import('@astrojs/react/server.js');

    container.addServerRenderer({
      renderer: reactRenderer,
      name: '@astrojs/react'
    });

    container.addClientRenderer({
      name: '@astrojs/react',
      entrypoint: '@astrojs/react/client.js'
    });
  }

  if (integrations.includes('svelte')) {
    const { default: svelteRenderer } = await import('@astrojs/svelte/server.js');

    container.addServerRenderer({
      renderer: svelteRenderer,
      name: '@astrojs/svelte'
    });

    container.addClientRenderer({
      name: '@astrojs/svelte',
      entrypoint: '@astrojs/svelte/client.js'
    });
  }

  if (integrations.includes('vue')) {
    const { default: vueRenderer } = await import('@astrojs/vue/server.js');

    container.addServerRenderer({
      renderer: vueRenderer,
      name: '@astrojs/vue'
    });

    container.addClientRenderer({
      name: '@astrojs/vue',
      entrypoint: '@astrojs/vue/client.js'
    });
  }

  if (integrations.includes('solid')) {
    const { default: solidRenderer } = await import('@astrojs/solid-js/server.js');

    container.addServerRenderer({
      name: '@astrojs/solid-js',
      renderer: {
        ...solidRenderer,
        name: '@astrojs/solid-js'
      }
    });

    container.addClientRenderer({
      name: '@astrojs/solid-js',
      entrypoint: '@astrojs/solid-js/client.js'
    });
  }

  if (integrations.includes('preact')) {
    const { default: preactRenderer } = await import('@astrojs/preact/server.js');

    container.addServerRenderer({
      name: '@astrojs/preact',
      renderer: preactRenderer
    });

    container.addClientRenderer({
      name: '@astrojs/preact',
      entrypoint: '@astrojs/preact/client.js'
    });
  }
}

export async function handlerFactory(integrations: SupportedFramework[]) {
  const container = await AstroContainer.create({
    // Somewhat hacky way to force client-side Storybook's Vite to resolve modules properly
    resolve: async (s) => {
      if (
        s.startsWith('astro:scripts') ||
        s.startsWith('@astrojs/react/client') ||
        s.startsWith('@astrojs/solid-js/client') ||
        s.startsWith('@astrojs/preact/client') ||
        s.startsWith('@astrojs/svelte/client') ||
        s.startsWith('@astrojs/vue/client')
      ) {
        return `/@id/${s}`;
      }

      return s;
    }
  });

  await attachRenderers(container, integrations);

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
