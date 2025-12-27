import { composeStories } from '@storybook/astro';
import { testStoryRenders, testStoryComposition } from '../../../test-utils.js';
import * as stories from './Accordion.stories.jsx';

const { Default } = composeStories(stories);

// Test basic composition
testStoryComposition('Default', Default);

// Test rendering capability
testStoryRenders('Accordion Default', Default);
