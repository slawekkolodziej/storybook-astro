import type { Integration } from './base.ts';
import type { Options as ViteSolidPluginOptions } from 'vite-plugin-solid';

export type Options = Pick<ViteSolidPluginOptions, 'include' | 'exclude'>;

export class SolidIntegration implements Integration {
  readonly name = 'solid';
  readonly dependencies = ['@astrojs/solid-js', 'storybook-solidjs-vite', 'solid-js'];
  readonly options: Options;
  readonly storybookEntryPreview = 'storybook-solidjs-vite/renderer/entry-preview';
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
}
