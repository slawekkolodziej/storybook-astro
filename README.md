# @storybook/astro

An experimental Storybook framework implementation that enables support for Astro components in Storybook.

> **⚠️ Experimental**: This is an experimental project and is not ready for production use. The implementation is actively being developed and tested.

## Requirements

- **Node.js**: 20.16.0+, 22.19.0+, or 24.0.0+ (required for Storybook 10's ESM-only support)
- **Storybook**: 10.0.0+
- **Astro**: 5.0.0+
- **Vite**: 6.0.0+

## What This Package Does

This package provides a complete Storybook framework integration for Astro components, enabling developers to:

- **Document and test Astro components** in Storybook's interactive environment
- **Server-side render Astro components** using Astro's Container API
- **Support multiple UI frameworks** within Astro components (React, Vue, Svelte, Preact, Solid, Alpine.js)
- **Live preview components** with hot module replacement during development
- **Handle component hydration** and client-side interactivity

## Architecture

The package consists of two main components:

### 1. `@storybook/astro` (Framework Package)

The core framework implementation that integrates Astro with Storybook's build system:

- **Vite Plugin Integration**: Configures Vite to handle Astro components during the Storybook build process
- **Middleware Handler**: Sets up an Astro Container that renders components server-side on demand
- **Framework Integrations**: Manages multiple UI framework renderers (React, Vue, Svelte, etc.) that can be used within Astro components
- **Module Resolution**: Handles special module resolution for Astro's runtime and framework-specific modules

**Key files:**
- `src/preset.ts` - Storybook framework configuration and Vite setup
- `src/middleware.ts` - Astro Container setup and server-side rendering handler
- `src/integrations/` - Integration adapters for React, Vue, Svelte, Preact, Solid, and Alpine.js
- `src/viteStorybookAstroMiddlewarePlugin.ts` - Vite plugin for handling render requests

### 2. `@storybook/astro-renderer` (Client Renderer)

The client-side rendering package that manages how Astro components are displayed in Storybook's preview:

- **Render Function**: Determines how to render different component types (Astro components, HTML strings, DOM elements, framework components)
- **Communication Layer**: Sends render requests from the browser to the Astro middleware via Vite's HMR channel
- **Fallback Rendering**: Delegates to framework-specific renderers (React, Vue, etc.) when `parameters.renderer` is specified
- **Style Management**: Handles Astro's scoped styles and HMR updates
- **Script Execution**: Manages client-side scripts and hydration for interactive components

**Key files:**
- `src/render.tsx` - Main rendering logic and Canvas integration
- `src/preset.ts` - Client-side preview annotations

## How It Works

1. **Story Definition**: Stories import Astro components (`.astro` files) and define variations with different props
2. **Component Detection**: The renderer identifies Astro components by checking for the `isAstroComponentFactory` flag
3. **Server Rendering**: When an Astro component is detected, a render request is sent to the Vite dev server middleware
4. **Container Rendering**: The middleware uses Astro's Container API to render the component with the provided props and slots
5. **HTML Injection**: The rendered HTML is sent back to the client and injected into Storybook's canvas
6. **Hydration**: Client-side scripts are executed to add interactivity (for frameworks like Alpine.js or framework islands)
7. **HMR Updates**: Changes to components trigger re-renders while preserving state when possible

## Setup Instructions

### Prerequisites

Ensure you have a compatible Node.js version installed:
```bash
node --version
# Should be 20.16.0+, 22.19.0+, or 24.0.0+
```

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd storybook-astro
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Run Storybook:
   ```bash
   yarn storybook
   ```

4. Run tests (validates component rendering and framework integration health):
   ```bash
   yarn test
   ```

## Usage Example

Create a story for an Astro component:

```javascript
// Card.stories.jsx
import Card from './Card.astro';

export default {
  title: 'Components/Card',
  component: Card,
};

export const Default = {
  args: {
    title: 'My Card Title',
    content: 'Card content goes here',
  },
};

export const Highlighted = {
  args: {
    title: 'Featured Card',
    content: 'This card is highlighted',
    highlight: true,
  },
};
```

## Testing and Portable Stories

### Component Testing with `composeStories`

The package includes a `composeStories` function that enables testing of Storybook stories outside the Storybook environment. This allows you to verify that components render correctly and detect integration issues with different frameworks.

```javascript
// Card.test.ts
import { composeStories } from '@storybook/astro';
import { testStoryRenders, testStoryComposition } from './test-utils';
import * as stories from './Card.stories.jsx';

const { Default, Highlighted } = composeStories(stories);

// Test that the story can be composed
testStoryComposition('Default', Default);

// Test that the story renders successfully in Storybook
testStoryRenders('Card Default', Default);
```

### Framework Integration Health

The test suite validates the health of framework integrations by attempting to render components from each supported framework. Tests will:

- **✅ Pass** for frameworks with working integrations (Astro, React, Vue, Svelte, Alpine.js)
- **❌ Fail** for frameworks with broken integrations, showing clear error messages:

```bash
❌ Preact Counter Default has a broken framework integration: 
   Renderer 'preact' not found. Available renderers: react, vue, svelte

❌ Solid Accordion Default has a broken framework integration:
   Renderer 'solid' not found. Available renderers: react, vue, svelte
```

This provides immediate feedback on which framework integrations need attention.

### Available Testing Functions

- **`composeStories(stories)`** - Composes all stories from a story file for testing
- **`composeStory(story, meta)`** - Composes a single story for testing
- **`setProjectAnnotations(annotations)`** - Sets global Storybook configuration for tests

### Test Utilities

The project includes standardized test utilities in `test-utils.ts`:

- **`testStoryComposition(name, story)`** - Verifies story can be imported and composed
- **`testStoryRenders(name, story)`** - Validates story renders without errors

These utilities provide consistent testing patterns across all component tests.

## Framework Integration

Configure framework integrations in `.storybook/main.js`:

```javascript
import { react, vue, svelte, preact, solid, alpinejs } from '@storybook/astro/integrations';

export default {
  framework: {
    name: '@storybook/astro',
    options: {
      integrations: [
        react({ include: ['**/react/*'] }),
        vue(),
        svelte(),
        preact({ include: ['**/preact/*'] }),
        solid({ include: ['**/solid/*'] }),
        alpinejs({ entrypoint: './.storybook/alpine-entrypoint.js' }),
      ],
    },
  },
};
```

## Project Structure

```
storybook-astro/
├── packages/
│   └── @storybook/
│       ├── astro/              # Framework package
│       │   ├── src/
│       │   │   ├── integrations/  # Framework integrations
│       │   │   ├── middleware.ts  # SSR handler
│       │   │   ├── preset.ts      # Storybook config
│       │   │   └── vite*.ts       # Vite plugins
│       │   └── package.json
│       └── astro-renderer/     # Client renderer
│           ├── src/
│           │   ├── render.tsx     # Rendering logic
│           │   └── preset.ts      # Preview setup
│           └── package.json
├── src/
│   └── components/             # Example components
├── .storybook/                 # Storybook configuration
└── package.json                # Root package
```

## Known Issues

### Preact Framework Compatibility

Preact components currently fail to render with the error: `TypeError: Cannot add property __, object is not extensible`. This occurs because Preact components become non-extensible after creation, preventing the framework renderer from adding necessary properties for Storybook integration. The issue persists even when using `@storybook/preact-vite` instead of `@storybook/preact`. A custom renderer solution similar to the SolidJS implementation may be required.

### SolidJS Framework Compatibility

SolidJS components fail to render properly in Storybook due to fundamental architectural incompatibilities. The `storybook-solidjs-vite` renderer is designed to work as a standalone Storybook framework (using `framework: "storybook-solidjs-vite"`), not as a renderer within the `@storybook/astro` framework. When SolidJS components are rendered, they show console warnings like "computations created outside a `createRoot` or `render` will never be disposed" and components appear blank because they're created outside the proper SolidJS rendering context. The official SolidJS renderer expects to control the entire rendering lifecycle, which conflicts with Astro's framework-delegation approach.

### Vue Component Styling

Vue single-file components (`.vue`) with `<style scoped>` blocks may encounter PostCSS parsing errors ("Unknown word" errors) when styles are tightly formatted without spacing between CSS rule sets. This is a PostCSS parsing issue in the Vue SFC compiler.

### Other Known Issues

- This is experimental software not ready for production
- Some Astro features may not work as expected in the Storybook environment
- Performance may need optimization for large component libraries
- Hot module replacement for styles requires manual trigger in some cases

## Roadmap: Astro Framework Feature Support

This section tracks Astro's built-in framework features and their compatibility status with Storybook Astro. Many Astro features rely on special module resolution (e.g., `astro:*` imports) that may require additional configuration to work within Storybook's environment.

### ✅ Supported Features

- **Component Rendering** - Core Astro component rendering via Container API
- **Props & Slots** - Passing data and content to components
- **Scoped Styles** - Component-scoped CSS
- **Multiple Framework Support** - React, Vue, Svelte, Alpine.js (Preact and Solid have known issues)
- **Client Directives** - `client:load`, `client:only`, etc. for framework components

### ⚠️ Partial Support

- **`astro:assets` (Image Optimization)** - Works in components but requires fallback approach for Storybook stories due to module resolution issues. Components can accept both `ImageMetadata` and string URLs to maintain compatibility.

### ❌ Not Yet Supported

- **View Transitions** - Astro's built-in View Transitions API (`<ViewTransitions />` component)
- **Content Collections** - `astro:content` module for type-safe content management
- **Middleware** - Astro's middleware system for request/response handling
- **API Routes** - Server endpoints (`/pages/api/*` routes)
- **Server Islands** - Dynamic content islands with server-side rendering
- **Actions** - Type-safe backend functions callable from frontend (`astro:actions`)
- **Environment Variables** - `astro:env` module for managing environment variables
- **Glob Imports** - `Astro.glob()` for batch file imports
- **Database Integration** - Astro DB and database utilities
- **Internationalization (i18n)** - Built-in i18n routing and helpers
- **Prefetch** - Automatic page prefetching utilities
- **Dev Toolbar** - Development toolbar integrations
- **Markdown/MDX Features** - Advanced markdown processing features beyond basic rendering

### 🔮 Future Considerations

- **Static Site Generation (SSG)** - Currently only dev server rendering is supported; static builds would require architectural changes
- **Server-Side Rendering (SSR)** - Full SSR mode compatibility
- **Adapters** - Integration with Astro's deployment adapters (Netlify, Vercel, etc.)
- **Error Handling** - Better error boundaries and recovery mechanisms
- **Performance Optimizations** - Caching strategies and render optimization

### Contributing to Feature Support

If you're interested in helping add support for any of these features, please see the `AGENTS.md` file for development guidance and check the [GitHub issues](https://github.com/storybookjs/storybook/issues/18356) for ongoing discussions.

## Contributing

**Any help is highly appreciated!** This project is experimental and welcomes contributions. Please see the `AGENTS.md` file for guidance on AI-assisted development.

## Related Links

- [Feature Request: storybookjs/storybook#18356](https://github.com/storybookjs/storybook/issues/18356)
- [Storybook Framework Documentation](https://storybook.js.org/docs/configure/integration/frameworks)
- [Astro Container API](https://docs.astro.build/en/reference/container-reference/)

## License

MIT
