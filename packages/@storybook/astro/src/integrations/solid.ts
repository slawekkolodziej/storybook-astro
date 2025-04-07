import type { Integration } from './base';
import type { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { RenderContext } from 'storybook/internal/types';
import type { Options as ViteSolidPluginOptions } from 'vite-plugin-solid';

export type Options = Pick<ViteSolidPluginOptions, 'include' | 'exclude'>;

export class SolidIntegration implements Integration {
  readonly name = 'solid';
  readonly dependencies = ['@astrojs/solid-js', 'storybook-solidjs', 'solid-js'];
  readonly options: Options;

  constructor(options: Options = {}) {
    this.options = options;
  }

  async addRenderer(container: AstroContainer): Promise<void> {
    const mod = await import('@astrojs/solid-js/server.js');

    container.addServerRenderer({
      name: '@astrojs/solid-js',
      renderer: {
        ...mod.default,
        name: '@astrojs/solid-js'
      }
    });

    container.addClientRenderer({
      name: '@astrojs/solid-js',
      entrypoint: '@astrojs/solid-js/client.js'
    });
  }

  resolveClient(moduleName: string): string | undefined {
    if (moduleName.startsWith('@astrojs/solid-js/client')) {
      return `/@id/${moduleName}`;
    }
  }

  async loadIntegration() {
    const framework = await import('@astrojs/solid-js');

    return framework.default(this.options);
  }

  async renderToCanvas(ctx: RenderContext, element: HTMLElement) {
    const { renderToCanvas } = await import('storybook-solidjs/dist/entry-preview.mjs');

    return renderToCanvas(ctx, element);
  }
}
