import { expect, test } from 'vitest';
import Counter from './Counter.svelte';

test('Svelte Counter component can be imported', () => {
  expect(Counter).toBeDefined();
});
