import Card from '../components/Card.astro';

export default {
  title: 'Astro/Card',
  component: Card,
  args: {}
};

export const Primary = {
  args: {}
};

export const Custom = {
  args: {
    title: 'Custom title',
    content: 'Custom content'
  }
};

export const WithSlots = {
  args: {
    title: 'Some other title',
    slots: {
      main: '<strong>Content in a slot!</strong>'
    }
  }
};

export const FromPublicApi = {
  args: {
    apiUrl: 'https://jsonplaceholder.typicode.com/todos/1'
  }
};

export const ApiDown = {
  args: {
    apiUrl: 'https://jsonplaceholder.typicode.com/todos/1'
  }
};
