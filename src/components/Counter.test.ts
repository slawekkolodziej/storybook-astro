import { screen } from '@testing-library/dom';
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

  document.body.innerHTML = await container.renderToString(Component, renderingOptions);
}

test('Card with slots', async () => {
  await renderAstroComponent(Counter);

  expect(screen.getByTestId('astro-paragraph')).toHaveTextContent(
    'This is astro component!'
  );

  expect(screen.getByTestId('react-counter')).toHaveTextContent(
    'React counter: 1'
  );

  expect(screen.getByTestId('solid-counter')).toHaveTextContent(
    'Solid counter: 1'
  );

  expect(screen.getByTestId('preact-counter')).toHaveTextContent(
    'Preact counter: 1'
  );

  expect(screen.getByTestId('svelte-counter')).toHaveTextContent(
    'Svelte counter: 1'
  );

  expect(screen.getByTestId('vue-counter')).toHaveTextContent(
    'Vue counter: 1'
  );
});

test('Card with custom title', async () => {
  await renderAstroComponent(Counter, {
    props: {
      title: 'Custom title'
    }
  });

  expect(screen.getByText('Custom title')).toBeInTheDocument();
});
