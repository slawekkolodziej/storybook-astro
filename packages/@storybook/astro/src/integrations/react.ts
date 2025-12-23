import type { Integration } from './base.ts';
import type { Options as ViteReactPluginOptions } from '@vitejs/plugin-react';

export type Options = Pick<ViteReactPluginOptions, 'include' | 'exclude'>;

export class ReactIntegration implements Integration {
  readonly name = 'react';
  readonly dependencies = ['@astrojs/react', '@storybook/react', 'react', 'react-dom'];
  readonly options: Options;
  readonly storybookEntryPreview = '@storybook/react/dist/entry-preview.mjs';

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
}
