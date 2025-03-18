import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import reactRenderer from '@astrojs/react/server.js';
import solidRenderer from '@astrojs/solid-js/server.js';
import { expect, test } from 'vitest';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

import Counter from './Counter.astro';

async function renderAstroComponent(
  Component: AstroComponentFactory,
  renderingOptions = {}
) {
  const container = await AstroContainer.create();

  container.addServerRenderer({
    name: '@astrojs/react',
    renderer: reactRenderer,
  });
  container.addClientRenderer({
    name: '@astrojs/react',
    entrypoint: '@astrojs/react/client.js',
  });

  container.addServerRenderer({
    name: '@astrojs/solid-js',
    renderer: {
      ...solidRenderer,
      name: '@astrojs/solid-js',
    },
  });

  container.addClientRenderer({
    name: '@astrojs/solid-js',
    entrypoint: '@astrojs/solid-js/client.js',
  });

  return container.renderToString(Component, renderingOptions);
}

test('Card with slots', async () => {
  const result = await renderAstroComponent(Counter);

  expect(result).toContain('Hello World!');
  expect(result).toContain('This is astro component!');
  expect(result).toContain('React counter: <!-- -->1');
  expect(result).toContain('Solid counter: 0');
});

test('Card with custom title', async () => {
  const result = await renderAstroComponent(Counter, {
    props: {
      title: 'Custom title',
    },
  });

  expect(result).toContain('Custom title');
  expect(result).toContain('This is astro component!');
  expect(result).toContain('React counter: <!-- -->1');
  expect(result).toContain('Solid counter: 0');
});
