import { react, solid, preact, vue, svelte, alpinejs } from '@storybook/astro/integrations';

/** @type { import('@storybook/astro').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/astro',
    options: {
      integrations: [
        react({
          include: ['**/CounterReact/*']
        }),
        solid({
          include: ['**/CounterSolid/*']
        }),
        preact({
          include: ['**/CounterPreact/*']
        }),
        vue(),
        svelte(),
        alpinejs()
      ]
    },
  },
};

export default config;
