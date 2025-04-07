import type { Integration } from './base';
import type { Options as ViteReactPluginOptions } from '@vitejs/plugin-react';
import type { RenderContext } from 'storybook/internal/types';

export type Options = Pick<ViteReactPluginOptions, 'include' | 'exclude'>;

export class ReactIntegration implements Integration {
  readonly name = 'react';
  readonly dependencies = ['@astrojs/react', '@storybook/react', 'react', 'react-dom'];
  readonly options: Options;

  readonly renderer = {
    server: {
      name: '@astrojs/react',
      entrypoint: '@astrojs/react/server.js'
    },
    client: {
      name: '@astrojs/react',
      entrypoint: '@astrojs/react/client.js'
    }
  };

  constructor(options: Options = {}) {
    this.options = options;
  }

  resolveClient(moduleName: string): string | undefined {
    if (moduleName.startsWith('@astrojs/react/client')) {
      return `/@id/${moduleName}`;
    }
  }

  async loadIntegration() {
    const framework = await import('@astrojs/react');

    return framework.default(this.options);
  }

  async loadIntegration2() {
    return Promise.all([import('@astrojs/react'), import('@astrojs/react/server.js')]);
  }

  async renderToCanvas(ctx: RenderContext, element: HTMLElement): Promise<void> {
    const { renderToCanvas } = await import('@storybook/react/dist/entry-preview.mjs');

    return renderToCanvas(ctx, element);
  }
}
