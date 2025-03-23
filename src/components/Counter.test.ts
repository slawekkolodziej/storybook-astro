import { JSDOM } from 'jsdom';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import reactRenderer from '@astrojs/react/server.js';
import solidRenderer from '@astrojs/solid-js/server.js';
import preactRenderer from '@astrojs/preact/server.js';
import svelteRenderer from '@astrojs/svelte/server.js';
import vueRenderer from '@astrojs/vue/server.js';

import { expect, test } from 'vitest';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

import Counter from './Counter.astro';

async function renderAstroComponent(Component: AstroComponentFactory, renderingOptions = {}) {
  const container = await AstroContainer.create();

  container.addServerRenderer({
    name: '@astrojs/react',
    renderer: reactRenderer
  });
  container.addClientRenderer({
    name: '@astrojs/react',
    entrypoint: '@astrojs/react/client.js'
  });

  container.addServerRenderer({
    name: '@astrojs/solid-js',
    renderer: {
      ...solidRenderer,
      name: '@astrojs/solid-js'
    }
  });

  container.addClientRenderer({
    name: '@astrojs/solid-js',
    entrypoint: '@astrojs/solid-js/client.js'
  });

  container.addServerRenderer({
    name: '@astrojs/preact',
    renderer: preactRenderer
  });

  container.addClientRenderer({
    name: '@astrojs/preact',
    entrypoint: '@astrojs/preact/client.js'
  });

  container.addServerRenderer({
    renderer: svelteRenderer,
    name: '@astrojs/svelte'
  });

  container.addClientRenderer({
    name: '@astrojs/svelte',
    entrypoint: '@astrojs/svelte/client.js'
  });

  container.addServerRenderer({
    renderer: vueRenderer,
    name: '@astrojs/vue'
  });

  container.addClientRenderer({
    name: '@astrojs/vue',
    entrypoint: '@astrojs/vue/client.js'
  });

  const html = await container.renderToString(Component, renderingOptions);

  return new JSDOM(html);
}

test('Card with slots', async () => {
  const result = await renderAstroComponent(Counter);
  const doc = result.window.document;

  expect(doc.querySelector('[data-test-id="astro-paragraph"]')?.textContent).toEqual(
    'This is astro component!'
  );

  expect(doc.querySelector('[data-test-id="react-counter"] > span')?.textContent).toEqual(
    'React counter: 1'
  );

  expect(doc.querySelector('[data-test-id="solid-counter"] > span')?.textContent).toEqual(
    'Solid counter: 1'
  );

  expect(doc.querySelector('[data-test-id="preact-counter"] > span')?.textContent).toEqual(
    'Preact counter: 1'
  );

  expect(doc.querySelector('[data-test-id="svelte-counter"] > span')?.textContent).toEqual(
    'Svelte counter: 1'
  );

  expect(doc.querySelector('[data-test-id="vue-counter"] > span')?.textContent).toEqual(
    'Vue counter: 1'
  );
});

test('Card with custom title', async () => {
  const result = await renderAstroComponent(Counter, {
    props: {
      title: 'Custom title'
    }
  });
  const doc = result.window.document;

  expect(doc.querySelector('h2')?.textContent).toEqual('Custom title');
});
