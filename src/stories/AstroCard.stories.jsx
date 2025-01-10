import Welcome from '../components/Welcome.astro';

export default {
  title: 'Astro/Welcome',
  component: Welcome,
  args: {}
};

export const Primary = {
  args: {},
};

export const Secondary = {
  args: {
    title: 'Some other title',
  },
};
