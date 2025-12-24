import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import Counter from './Counter.astro';

async function renderAstroComponent(Component: AstroComponentFactory, renderingOptions = {}) {
  const container = await AstroContainer.create();
  document.body.innerHTML = await container.renderToString(Component, renderingOptions);
}

test('Alpine Counter renders correctly', async () => {
  await renderAstroComponent(Counter);
  expect(document.body.innerHTML).toBeTruthy();
  expect(document.body.innerHTML).toContain('Alpine counter');
});
