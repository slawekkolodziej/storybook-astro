import type { Integration } from './base';
import type { Options as _foo, PluginOptions, SvelteConfig } from '@sveltejs/vite-plugin-svelte';

// Using Omit with empty string to preserve index signature
// capabilities while maintaining the structure of the original types
export type Options = Omit<PluginOptions, ''> & Omit<SvelteConfig, 'vitePlugin'>;

const DEFAULT_OPTIONS: Options = {
  extensions: ['.svelte']
};

export class SvelteIntegration implements Integration {
  readonly name = 'svelte';
  readonly dependencies = ['@astrojs/svelte', '@storybook/svelte', 'svelte'];
  readonly options: Options;
  readonly storybookEntryPreview = '@storybook/svelte/dist/entry-preview.mjs';
  readonly renderer = {
    server: {
      entrypoint: '@astrojs/svelte/server.js',
      name: '@astrojs/svelte'
    },
    client: {
      name: '@astrojs/svelte',
      entrypoint: '@astrojs/svelte/client.js'
    }
  };

  constructor(options: Options = DEFAULT_OPTIONS) {
    this.options = options;
  }

  resolveClient(moduleName: string): string | undefined {
    if (moduleName.startsWith('@astrojs/svelte/client')) {
      return `/@id/${moduleName}`;
    }
  }

  async loadIntegration() {
    const framework = await import('@astrojs/svelte');

    return framework.default(this.options);
  }
}
