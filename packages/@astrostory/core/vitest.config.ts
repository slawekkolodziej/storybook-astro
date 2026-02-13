/// <reference types="vitest" />
import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: '@astrostory/core',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}']
  }
});
