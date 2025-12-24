import { expect, test } from 'vitest';
import Accordion from './Accordion.jsx';

test('React Accordion component can be imported', () => {
  expect(Accordion).toBeDefined();
  expect(typeof Accordion).toBe('function');
});
