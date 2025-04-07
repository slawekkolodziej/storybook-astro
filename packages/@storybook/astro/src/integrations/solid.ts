import type { Integration } from './base';
import type { RenderContext } from 'storybook/internal/types';
import type { Options as ViteSolidPluginOptions } from 'vite-plugin-solid';

export type Options = Pick<ViteSolidPluginOptions, 'include' | 'exclude'>;

export class SolidIntegration implements Integration {
  readonly name = 'solid';
  readonly dependencies = ['@astrojs/solid-js', 'storybook-solidjs', 'solid-js'];
  readonly options: Options;
  readonly renderer = {
    server: {
      name: '@astrojs/solid-js',
      entrypoint: '@astrojs/solid-js/server.js'
    },
    client: {
      name: '@astrojs/solid-js',
      entrypoint: '@astrojs/solid-js/client.js'
    }
  };

  constructor(options: Options = {}) {
    this.options = options;
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
