# Astro Storybook

The goal of this project is to enable support for Astro components in Storybook.

This repository is an experimental project and is not a fully functional Storybook addon. It is not ready for production use.

It uses Vitest To verify that Astro Container API works as expected. You can try it out by running `yarn test`.

## Known issues

- [x] ~~UI components are not hydrated when using `client` directives~~
- [x] ~~Container API does not work properly in Astro 5.x (it looks like a potential bug in Astro).~~ Actually it did work, but required updating Vite and Vitest.
- [x] ~~Currently, only React integration is supported, and it is hardcoded.~~ 
- [x] ~~Astro components with CSS throw errors.~~
- [x] ~~Hydrate CSS chunks~~
- [x] ~~Unhandled rejection errors occur sometimes when rendering Astro components.~~ I don't see this anymore, switching to hmr websocket did the trick
- [ ] React and Solid integrations work, other frameworks should probably work too, but integration needs to get a bit simpler

## Setup instructions

1. Clone the repo
2. Run `yarn install`
3. Run `yarn storybook`

## Code structure

The repository is based on Astro blank project.

Code responsible for Storybook integration lives in two packages:
- `packages/@storybook/astro` - defines Storybook framework (https://storybook.js.org/docs/configure/integration/frameworks), it is responsible for server-side rendering Astro components
- `packages/@storybook/astro-renderer` - a package that gets imported into client-side of Storybook, it sends render requests to Astro rendering proxy.

**Any help is highly appreciated!**