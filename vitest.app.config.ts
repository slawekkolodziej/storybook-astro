/// <reference types="vitest" />
import { defineProject } from 'vitest/config';
import { getViteConfig } from 'astro/config';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
import vue from '@astrojs/vue';
import preact from '@astrojs/preact';
import svelte from '@astrojs/svelte';
import alpinejs from '@astrojs/alpinejs';
import { solidVitestPatch } from './lib/test-utils';

const vitestProject = defineProject({
  mode: 'test',
  test: {
    name: 'app',
    setupFiles: ['./lib/vitest-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}']
  }
});

export default getViteConfig(vitestProject as unknown as Parameters<typeof getViteConfig>[0], {
  configFile: false,
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
