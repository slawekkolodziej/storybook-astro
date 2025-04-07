import type { Integration } from './base';
import type { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { RenderContext } from 'storybook/internal/types';
import type { Options as _foo, PluginOptions, SvelteConfig } from '@sveltejs/vite-plugin-svelte';

// Using Omit with empty string to preserve index signature 
// capabilities while maintaining the structure of the original types
export type Options = Omit<PluginOptions, ''> & Omit<SvelteConfig, 'vitePlugin'>;

const DEFAULT_OPTIONS: Options = {
  extensions: ['.svelte']
};

export class SvelteIntegration implements Integration {
  readonly name = 'svelte';
  readonly dependencies = ['@astrojs/svelte', '@storybook/svelte', 'svelte'];
  readonly options: Options;

  constructor(options: Options = DEFAULT_OPTIONS) {
    this.options = options;
  }

  async addRenderer(container: AstroContainer): Promise<void> {
    const mod = await import('@astrojs/svelte/server.js');

    container.addServerRenderer({
      renderer: mod.default,
      name: '@astrojs/svelte'
    });

    container.addClientRenderer({
      name: '@astrojs/svelte',
      entrypoint: '@astrojs/svelte/client.js'
    });
  }

  resolveClient(moduleName: string): string | undefined {
    if (moduleName.startsWith('@astrojs/svelte/client')) {
      return `/@id/${moduleName}`;
    }
  }

  async loadIntegration() {
    const framework = await import('@astrojs/svelte');

    return framework.default(this.options);
  }

  async renderToCanvas(ctx: RenderContext, element: HTMLElement) {
    // @ts-expect-error Missing declaration
    const { renderToCanvas } = await import('@storybook/svelte/dist/entry-preview.mjs');

    return renderToCanvas(ctx, element);
  }
}
