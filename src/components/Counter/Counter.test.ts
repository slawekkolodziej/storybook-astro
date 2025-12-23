import { screen } from '@testing-library/dom';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

import { expect, test } from 'vitest';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

import Counter from './Counter.astro';

async function renderAstroComponent(Component: AstroComponentFactory, renderingOptions = {}) {
  const container = await AstroContainer.create();
  document.body.innerHTML = await container.renderToString(Component, renderingOptions);
}

test('Vanilla JS Counter renders correctly', async () => {
  await renderAstroComponent(Counter);

  expect(screen.getByTestId('vanilla-counter')).toHaveTextContent(
    'Vanilla JS counter: 1'
  );

  const button = screen.getByRole('button', { name: '+1' });
  expect(button).toBeInTheDocument();
});
