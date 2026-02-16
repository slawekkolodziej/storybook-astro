import baseConfig from '../.storybook/main.js';

/** @type { import('@astrostory/core').StorybookConfig } */
const config = {
  ...baseConfig,
  framework: {
    ...baseConfig.framework,
    options: {
      ...baseConfig.framework.options,
      renderMode: 'static'
    }
  }
};

delete config.framework.options.storyRules;

export default config;
