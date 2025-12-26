import { test, expect } from 'vitest';
import { composeStories } from '@storybook/astro';
import * as stories from './Counter.stories.js';

// Compose all the stories from the React Counter stories file
const { Default } = composeStories(stories);

test('React Counter Default story can be composed', async () => {
  // This test validates that composeStories works with React components
  // that have renderer parameters set
  expect(Default).toBeDefined();
  expect(typeof Default).toBe('function');
  
  // Check that the story has the expected properties
  expect(Default.storyName).toBe('Default');
  expect(Default.args).toBeDefined();
  
  // Verify that the story has the renderer parameter
  expect(Default.parameters).toBeDefined();
  expect(Default.parameters.renderer).toBe('react');
});

test('React Counter story has correct component reference', () => {
  // Verify that the composed story maintains the component reference
  expect(Default.component).toBeDefined();
  expect(typeof Default.component).toBe('function');
});