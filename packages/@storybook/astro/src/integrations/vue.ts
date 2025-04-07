import type { Integration } from './base';
import type { RenderContext } from 'storybook/internal/types';
import type { Options as VueOptions } from '@vitejs/plugin-vue';
import type { Options as VueJsxOptions } from '@vitejs/plugin-vue-jsx';

export type Options = Pick<VueOptions, 'include' | 'exclude'> & {
  jsx?: boolean | VueJsxOptions;
};

const DEFAULT_OPTIONS: Options = {
  include: ['**/*.vue']
};

export class VueIntegration implements Integration {
  readonly name = 'vue';
  // FIXME: Add missing dependencies
  readonly dependencies = ['@astrojs/vue', '@storybook/vue3'];
  readonly options: Options;

  readonly renderer = {
    server: {
      name: '@astrojs/vue',
      entrypoint: '@astrojs/vue/server.js'
    },
    client: {
      name: '@astrojs/vue',
      entrypoint: '@astrojs/vue/client.js'
    }
  };

  constructor(options: Options = DEFAULT_OPTIONS) {
    this.options = options;
  }

  resolveClient(moduleName: string): string | undefined {
    if (moduleName.startsWith('@astrojs/vue/client')) {
      return `/@id/${moduleName}`;
    }
  }

  async loadIntegration() {
    const framework = await import('@astrojs/vue');

    return framework.default(this.options);
  }

  async renderToCanvas(ctx: RenderContext, element: HTMLElement) {
    // @ts-expect-error Missing declaration
    const { renderToCanvas } = await import('@storybook/vue3/dist/entry-preview.mjs');

    return renderToCanvas(ctx, element);
  }
}
