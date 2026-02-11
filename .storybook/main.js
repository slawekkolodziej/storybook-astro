import { react, solid, preact, vue, svelte, alpinejs } from '@storybook/astro/integrations';

/** @type { import('@storybook/astro').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/astro',
    options: {
      integrations: [
        react({
          include: ['**/react/**']
        }),
        solid({
          include: ['**/solid/**']
        }),
        preact({
          include: ['**/preact/**']
        }),
        vue(),
        svelte(),
        alpinejs({
          entrypoint: './.storybook/alpine-entrypoint.js'
        })
      ]
    }
  }
};

export default config;
