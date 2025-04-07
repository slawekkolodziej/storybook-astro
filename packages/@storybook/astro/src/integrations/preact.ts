import type { Integration } from './base';
import type { PreactPluginOptions } from '@preact/preset-vite';
import type { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { RenderContext } from 'storybook/internal/types';

export type Options = Pick<PreactPluginOptions, 'include' | 'exclude'> & {
  compat?: boolean;
  devtools?: boolean;
};

export class PreactIntegration implements Integration {
  readonly name = 'preact';
  readonly dependencies = [
    '@astrojs/preact',
    '@storybook/preact',
    'preact'
  ];
  readonly options: Options;

  constructor(options: Options = {}) {
    this.options = options;
  }

  async addRenderer(container: AstroContainer): Promise<void> {
    const mod = await import('@astrojs/preact/server.js');

    container.addServerRenderer({
      renderer: mod.default,
      name: '@astrojs/preact'
    });

    container.addClientRenderer({
      name: '@astrojs/preact',
      entrypoint: '@astrojs/preact/client.js'
    });
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
