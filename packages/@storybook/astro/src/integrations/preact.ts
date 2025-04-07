import type { Integration } from './base';
import type { PreactPluginOptions } from '@preact/preset-vite';
import type { RenderContext } from 'storybook/internal/types';

export type Options = Pick<PreactPluginOptions, 'include' | 'exclude'> & {
  compat?: boolean;
  devtools?: boolean;
};

export class PreactIntegration implements Integration {
  readonly name = 'preact';
  readonly dependencies = ['@astrojs/preact', '@storybook/preact', 'preact'];
  readonly options: Options;

  readonly renderer = {
    server: {
      name: '@astrojs/preact',
      entrypoint: '@astrojs/preact/server.js'
    },
    client: {
      name: '@astrojs/preact',
      entrypoint: '@astrojs/preact/client.js'
    }
  };

  constructor(options: Options = {}) {
    this.options = options;
  }

  resolveClient(moduleName: string): string | undefined {
    if (moduleName.startsWith('@astrojs/preact/client')) {
      return `/@id/${moduleName}`;
    }
  }

  async loadIntegration() {
    const framework = await import('@astrojs/preact');

    return framework.default(this.options);
  }

  async renderToCanvas(ctx: RenderContext, element: HTMLElement) {
    // @ts-expect-error Missing declaration
    const { renderToCanvas } = await import('@storybook/preact/dist/entry-preview.mjs');

    return renderToCanvas(ctx, element);
  }
}
