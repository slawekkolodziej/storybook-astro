import { screen } from '@testing-library/dom';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import Card from './Card.astro';

async function renderAstroComponent(Component: AstroComponentFactory, renderingOptions = {}) {
  const container = await AstroContainer.create();
  document.body.innerHTML = await container.renderToString(Component, renderingOptions);
}

test('Card renders with default props', async () => {
  await renderAstroComponent(Card);
  expect(document.body.innerHTML).toContain('Default title');
  expect(document.body.innerHTML).toContain('Default content');
});

test('Card renders with highlight state', async () => {
  await renderAstroComponent(Card, {
    props: {
      title: 'Highlighted Card',
      content: 'This card has the highlight state enabled.',
      highlight: true
    }
  });
  expect(document.body.innerHTML).toContain('Highlighted Card');
  expect(document.body.innerHTML).toContain('highlight');
});
