import { composeStories } from '@storybook/astro';
import { testStoryRenders, testStoryComposition } from '../../../test-utils.js';
import * as stories from './Footer.stories.jsx';

const { Default } = composeStories(stories);

// Test basic composition
testStoryComposition('Default', Default);

// Test rendering capability
testStoryRenders('Footer Default', Default);
