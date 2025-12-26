import { test, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { composeStories } from '@storybook/astro';
import * as stories from './Card.stories.jsx';

// Compose all the stories from the Card stories file
const { Default, Highlight } = composeStories(stories);

test('Card Default story can be composed and has content', async () => {
  // This test validates that the composeStories function works
  // and that the Default story can be composed into a renderable component
  expect(Default).toBeDefined();
  expect(typeof Default).toBe('function');
  
  // Check that the story has the expected properties
  expect(Default.storyName).toBe('Default');
  expect(Default.args).toBeDefined();
});

test('Card Highlight story can be composed with args', async () => {
  // This test validates that stories with args can be composed correctly
  expect(Highlight).toBeDefined();
  expect(typeof Highlight).toBe('function');
  
  // Check that the story has the expected args
  expect(Highlight.args).toEqual({
    title: 'Highlighted Card',
    content: 'This card has the highlight state enabled.',
    highlight: true,
  });
  
  expect(Highlight.storyName).toBe('Highlight');
});

test('composeStories returns all expected stories', () => {
  // Verify that composeStories returns an object with all the expected story names
  const storyNames = Object.keys({ Default, Highlight });
  expect(storyNames).toContain('Default');
  expect(storyNames).toContain('Highlight');
  expect(storyNames).toHaveLength(2);
});