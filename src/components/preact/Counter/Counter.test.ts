import { expect, test } from 'vitest';
import Counter from './Counter.jsx';

test('Preact Counter component can be imported', () => {
  expect(Counter).toBeDefined();
  expect(typeof Counter).toBe('function');
});
