/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
import vue from '@astrojs/vue';
import preact from '@astrojs/preact';
import svelte from '@astrojs/svelte';
import alpinejs from '@astrojs/alpinejs';
import { solidVitestPatch } from './lib/test-utils';

const vitestConfig = defineConfig({
  mode: 'test',
  test: {
    // environment: 'happy-dom',
    setupFiles: ['./lib/vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'src/**/*.{js,jsx,ts,tsx,astro,vue,svelte}',
        'packages/**/src/**/*.{js,jsx,ts,tsx,astro,vue,svelte}',
        'packages/**/preset.{js,ts,mjs,cjs}'
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
        '**/*.stories.{js,jsx,ts,tsx,mdx}',
        '**/stories/**',
        '**/.astro/**',
        '**/coverage/**',
        '**/dist/**',
        '**/node_modules/**'
      ]
    }
  }
});

export default getViteConfig(vitestConfig as unknown as Parameters<typeof getViteConfig>[0], {
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
