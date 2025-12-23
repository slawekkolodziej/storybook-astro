import type { Integration } from './base.ts';

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
}
