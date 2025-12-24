import { expect, test } from 'vitest';
import Counter from './Counter.tsx';

test('Solid Counter component can be imported', () => {
  expect(Counter).toBeDefined();
  expect(typeof Counter).toBe('function');
});
