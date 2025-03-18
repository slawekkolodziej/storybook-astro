import Counter from '../components/Counter.astro';

export default {
  title: 'Astro/Counter',
  component: Counter,
  args: {},
};

export const Primary = {
  args: {},
};

export const Secondary = {
  args: {
    title: 'Some other title',
  },
};

export const WithSlots = {
  args: {
    title: 'Some other title',
  },
  slots: {
    main: '<strong>Content in a slot!</strong>',
  },
};
