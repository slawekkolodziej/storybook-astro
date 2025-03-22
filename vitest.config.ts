/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';
import react from '@astrojs/react';
// import solid from '@astrojs/solid-js';
import vue from '@astrojs/vue';
import preact from '@astrojs/preact';
import svelte from '@astrojs/svelte';
import alpinejs from '@astrojs/alpinejs';


export default getViteConfig({}, {
  // Don't read astro.config.mjs
  configFile: false,
  // Tests specific astro config
  integrations: [
    react({
      include: ['**/react/*'],
    }),
    // FIXME: Enable tests for Solid once it can run properly in Vitest
    // solid({
    //   include: ['**/solid/*'],
    // }),
    preact({
      include: ['**/preact/*'],
    }),
    vue(),
    svelte({ extensions: ['.svelte'] }),
    alpinejs(),
  ]
});
