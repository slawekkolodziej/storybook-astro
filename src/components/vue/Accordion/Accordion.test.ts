import { expect, test } from 'vitest';
import Accordion from './Accordion.vue';

test('Vue Accordion component can be imported', () => {
  expect(Accordion).toBeDefined();
  expect(typeof Accordion).toBe('object');
});
