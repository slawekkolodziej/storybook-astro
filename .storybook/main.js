import { react, solid, preact, vue, svelte, alpinejs } from '@astrostory/core/integrations';

/** @type { import('@astrostory/core').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-docs'],
  framework: {
    name: '@astrostory/core',
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
      ],
      sanitization: {
        args: ['**.html', '**.htmlContent'],
        slots: ['**']
      },
      storyRules: './.storybook/story-rules.ts'
    }
  }
};

export default config;
