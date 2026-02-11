# Agent Guidelines for astro-story

## Commands

- **Build**: `yarn build` (Astro), `yarn build-storybook` (Storybook)
- **Dev**: `yarn dev` (Astro), `yarn storybook` (Storybook on port 6006)
- **Test**: `yarn test` (Vitest), `yarn test --run` (single run)
- **Lint**: `eslint .` (no script defined, run directly)

## Code Style

- **Formatting**: Prettier with 2-space tabs, single quotes, semicolons, 100 char width
- **Imports**: Use type imports (`import type`) for types, separate type imports
- **Naming**: camelCase variables/functions, PascalCase components/types
- **Variables**: Declare with newline after (`newline-after-var`), newline before return
- **Unused vars**: Prefix with `_` to ignore (e.g., `_unusedParam`)
- **Console**: Only `console.warn` and `console.error` allowed
- **Curly braces**: Always use braces for control statements

## Framework Support

- Multi-framework: React, Vue, Svelte, Solid, Preact, Alpine.js
- Astro components use `.astro` extension with frontmatter
- Client directives: `client:load` for hydration

## Testing

- Vitest with happy-dom environment
- Test files: `**/*.{spec,test}.{js,ts,jsx,tsx}`
- Setup file: `lib/vitest-setup.ts`

## Conventions

- BE BRUTALLY HONEST! YOU CAN'T SUGARCOAT EVERYTHING I SAY. OUR GOAL IS TO END UP WITH PERFECT BALANCE BETWEEN GOOD SOFTWARE AND FAST-PACED DEVELOPMENT
- NEVER commit changes unless you are explicitly asked to do so, human must always review your changes!
