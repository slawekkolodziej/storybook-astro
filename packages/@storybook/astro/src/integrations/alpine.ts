import type { Integration } from './base';
import type { RenderContext } from 'storybook/internal/types';

export type Options = Record<string, unknown>;

export class AlpineIntegration implements Integration {
  readonly name = 'alpine';
  readonly dependencies = [
    '@astrojs/alpinejs',
    'alpinejs'
  ];
  readonly options: Options;
  readonly renderer = {};

  constructor(options: Options = {}) {
    this.options = options;
  }

  resolveClient(_moduleName: string): undefined {}

  async loadIntegration() {
    const framework = await import('@astrojs/alpinejs');

    return framework.default(this.options);
  }

  async renderToCanvas(_ctx: RenderContext, _element: HTMLElement) {
    return Promise.resolve();
  }
}
