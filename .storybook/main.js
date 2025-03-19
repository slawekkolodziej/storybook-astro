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
      integrations: ['svelte', 'preact', 'vue', 'react', 'solid'],
    },
  },
};
export default config;
