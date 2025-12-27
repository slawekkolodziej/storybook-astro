import { composeStories } from '@storybook/astro';
import { testStoryRenders, testStoryComposition } from '../../../../test-utils.js';
import * as stories from './Accordion.stories.js';

const { Default } = composeStories(stories);

// Test basic composition
testStoryComposition('Default', Default);

// Test rendering capability
testStoryRenders('Vue Accordion Default', Default);
