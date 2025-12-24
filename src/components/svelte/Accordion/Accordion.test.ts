import { expect, test } from 'vitest';
import Accordion from './Accordion.svelte';

test('Svelte Accordion component can be imported', () => {
  expect(Accordion).toBeDefined();
  expect(typeof Accordion).toBe('function');
});
