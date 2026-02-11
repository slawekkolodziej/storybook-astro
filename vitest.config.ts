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

const vitestConfig = defineConfig({
  mode: 'test',
  test: {
    // environment: 'happy-dom',
    setupFiles: ['./lib/vitest-setup.ts']
  }
});

export default getViteConfig(vitestConfig as UserConfig, {
  // Don't read astro.config.mjs
  configFile: false,
  // Tests specific astro config
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
    alpinejs(),
    solidVitestPatch()
  ]
});
