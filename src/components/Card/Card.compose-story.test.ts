import { test, expect } from 'vitest';
import { composeStory } from '@storybook/astro';
import meta, { Highlight } from './Card.stories.jsx';

// Compose a single story using composeStory function
const ComposedHighlight = composeStory(Highlight, meta);

test('Card Highlight story can be composed individually', async () => {
  // This test validates that the composeStory function (singular) works
  // for composing individual stories
  expect(ComposedHighlight).toBeDefined();
  expect(typeof ComposedHighlight).toBe('function');
  
  // Check that the composed story has the expected properties
  expect(ComposedHighlight.storyName).toBe('Highlight');
  expect(ComposedHighlight.args).toEqual({
    title: 'Highlighted Card',
    content: 'This card has the highlight state enabled.',
    highlight: true,
  });
});

test('composeStory preserves component metadata', () => {
  // Verify that the composed story maintains metadata from both story and meta
  expect(ComposedHighlight.component).toBeDefined();
  expect(ComposedHighlight.component).toBe(meta.component);
  
  // The title should come from the meta
  expect(meta.title).toBe('Card');
});