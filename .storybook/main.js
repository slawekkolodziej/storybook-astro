// This file has been automatically migrated to valid ESM format by Storybook.
import { react, solid, preact, vue, svelte, alpinejs } from '@storybook/astro/integrations';

/** @type { import('@storybook/astro').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  framework: {
    name: "@storybook/astro",
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
