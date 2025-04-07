import type { Integration } from './base';
import type { Options as ViteReactPluginOptions } from '@vitejs/plugin-react';
import type { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { RenderContext } from 'storybook/internal/types';

export type Options = Pick<ViteReactPluginOptions, 'include' | 'exclude'>;

export class ReactIntegration implements Integration {
  readonly name = 'react';
  readonly dependencies = ['@astrojs/react', '@storybook/react', 'react', 'react-dom'];
  readonly options: Options;

  constructor(options: Options = {}) {
    this.options = options;
  }

  async addRenderer(container: AstroContainer): Promise<void> {
    // const mod = await import('@astrojs/react/server.js');

    // container.addServerRenderer({
    //   renderer: mod.default,
    //   name: '@astrojs/react'
    // });

    // container.addClientRenderer({
    //   name: '@astrojs/react',
    //   entrypoint: '@astrojs/react/client.js'
    // });

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

  resolveClient(moduleName: string): string | undefined {
    if (moduleName.startsWith('@astrojs/react/client')) {
      return `/@id/${moduleName}`;
    }
  }

  async loadIntegration() {
    const framework = await import('@astrojs/react');

    return framework.default(this.options);
  }

  async renderToCanvas(ctx: RenderContext, element: HTMLElement) {

    return renderToCanvas(ctx, element);
  }
}
