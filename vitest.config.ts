/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
import vue from '@astrojs/vue';
import preact from '@astrojs/preact';
import svelte from '@astrojs/svelte';
import alpinejs from '@astrojs/alpinejs';
import type { UserConfig } from 'vite';
import { solidVitestPatch } from './lib/test-utils';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const vitestConfig = defineConfig({
  mode: 'test',
  test: {
    // environment: 'happy-dom',
    setupFiles: ['./lib/vitest-setup.ts'],
    projects: [{
      extends: true,
      plugins: [
        // The plugin will run tests for the stories defined in your Storybook config
        // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
        storybookTest({
          configDir: path.join(dirname, '.storybook')
        })
      ],
      test: {
        name: 'storybook',
        environment: 'happy-dom',
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  }
});

export default getViteConfig(vitestConfig as UserConfig, {
  // Don't read astro.config.mjs
  configFile: false,
  // Tests specific astro config
  integrations: [
    react({
      include: ['**/react/*']
    }),
    solid({
      include: ['**/solid/*']
    }),
    preact({
      include: ['**/preact/*']
    }),
    vue(),
    svelte({ extensions: ['.svelte'] }),
    alpinejs(),
    solidVitestPatch()
  ]
});
