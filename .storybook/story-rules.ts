import { defineStoryRules, type StoryRuleUse } from '@astrostory/core';
import { http, HttpResponse } from '@astrostory/core/msw-helpers';

const mockTodoSuccess: StoryRuleUse = ({ msw, mode }) => {
  msw.use(
    http.get('https://jsonplaceholder.typicode.com/todos/1', () => {
      return HttpResponse.json({
        userId: 42,
        id: 1,
        title: `Storybook ${mode} todo from story rules`,
        completed: mode === 'production'
      });
    })
  );
};

const mockTodoFailure: StoryRuleUse = ({ msw }) => {
  msw.use(
    http.get('https://jsonplaceholder.typicode.com/todos/1', () => {
      return HttpResponse.json({ message: 'Service unavailable' }, { status: 503 });
    })
  );
};

export default defineStoryRules({
  rules: [
    {
      match: ['astro/card/from-public-api'],
      use: [mockTodoSuccess]
    },
    {
      match: ['astro/card/api-down'],
      use: [mockTodoFailure]
    }
  ]
});
