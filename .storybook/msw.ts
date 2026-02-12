import { http, HttpResponse } from 'msw';
import type { MswConfigFactory } from '@astrostory/core';

const mswConfig: MswConfigFactory = ({ mode }) => {
  return {
    handlers: [
      http.get('https://jsonplaceholder.typicode.com/todos/*', () => {
        return HttpResponse.json({
          userId: 42,
          id: 1,
          title: `Storybook ${mode} todo from MSW`,
          completed: true
        });
      })
    ],
    options: {
      onUnhandledRequest: 'bypass'
    }
  };
};

export default mswConfig;
