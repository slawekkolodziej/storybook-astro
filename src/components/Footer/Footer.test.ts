import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import Footer from './Footer.astro';

async function renderAstroComponent(Component: AstroComponentFactory, renderingOptions = {}) {
  const container = await AstroContainer.create();
  document.body.innerHTML = await container.renderToString(Component, renderingOptions);
}

test('Footer renders correctly', async () => {
  await renderAstroComponent(Footer);
  expect(document.body.innerHTML).toBeTruthy();
});
