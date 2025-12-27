import './preview.css';

/** @type { import('@storybook/astro').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Overview', 'Astro', 'Alpine', 'React', 'Vue', 'Svelte', 'Preact', 'Solid'],
      },
    },
  },
};

export default preview;
