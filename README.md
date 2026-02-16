# Astro Storybook

Astro Storybook lets you render `.astro` components in Storybook with Astro integrations and story-aware backend rules.

This project is experimental and not ready for production use yet.

## What you get

- Astro component rendering in Storybook
- Multi-framework support through Astro integrations (`react`, `preact`, `solid`, `vue`, `svelte`, `alpinejs`)
- Server and static build modes via `framework.options.renderMode`
- Story-aware backend rules (`storyRules`) with:
  - MSW handlers
  - Module replacement mocks
- Dev + production render flows using the same Astro-based renderer pipeline

## Quick start

1. Install dependencies: `yarn install`
2. Start Storybook: `yarn storybook`

### Example `.storybook/main.js`

```js
import { react, solid, preact, vue, svelte, alpinejs } from '@astrostory/core/integrations';

/** @type { import('@astrostory/core').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-docs'],
  framework: {
    name: '@astrostory/core',
    options: {
      integrations: [react(), solid(), preact(), vue(), svelte(), alpinejs()]
    }
  }
};

export default config;
```

## Build modes

Astro Storybook supports two production render modes:

- `server` (default): runs stories through the Astro rendering server and supports `storyRules`
- `static`: prerenders Astro stories into static HTML and does not support `storyRules`

### Example: static mode

```js
import { react, solid, preact, vue, svelte, alpinejs } from '@astrostory/core/integrations';

/** @type { import('@astrostory/core').StorybookConfig } */
const config = {
  framework: {
    name: '@astrostory/core',
    options: {
      renderMode: 'static',
      integrations: [react(), solid(), preact(), vue(), svelte(), alpinejs()]
    }
  }
};

export default config;
```

## Story rules (MSW + module mocks)

Use `framework.options.storyRules` to attach backend behavior to specific stories.

```ts
import { defineStoryRules } from '@astrostory/core';
import { http, HttpResponse } from '@astrostory/core/msw-helpers';

export default defineStoryRules({
  rules: [
    {
      match: ['astro/card/from-public-api'],
      use: ({ msw, mode }) => {
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
      }
    }
  ]
});
```

## Security and sanitization

Security-specific options are documented in `SECURITY.md` to keep this README focused on day-to-day usage.

## Repo structure

- `packages/@astrostory/core`: Storybook framework integration and Astro render pipeline
- `packages/@astrostory/renderer`: client-side renderer bridge used by Storybook preview

## Common commands

- Dev Storybook: `yarn storybook`
- Build Storybook (server mode): `yarn build-storybook`
- Build Storybook (static mode): `yarn build-storybook.static`
- Run tests: `yarn test --run`
- Build app: `yarn build`

Contributions are welcome.
