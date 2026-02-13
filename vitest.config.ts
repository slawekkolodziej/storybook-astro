/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './vitest.app.config.ts',
      './packages/@astrostory/core/vitest.config.ts',
      './packages/@astrostory/renderer/vitest.config.ts',
      './packages/@storybook/astro/vitest.config.ts'
    ],
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
