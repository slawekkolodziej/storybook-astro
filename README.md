# @storybook/astro

An experimental Storybook framework implementation that enables support for Astro components in Storybook. This project addresses the feature request tracked in [storybookjs/storybook#18356](https://github.com/storybookjs/storybook/issues/18356).

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

4. Run tests (uses Vitest to verify Astro Container API):
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

## Known Limitations

- This is experimental software not ready for production
- Some Astro features may not work as expected in the Storybook environment
- Performance may need optimization for large component libraries
- Hot module replacement for styles requires manual trigger in some cases

## Contributing

**Any help is highly appreciated!** This project is experimental and welcomes contributions. Please see the `AGENTS.md` file for guidance on AI-assisted development.

## Related Links

- [Feature Request: storybookjs/storybook#18356](https://github.com/storybookjs/storybook/issues/18356)
- [Storybook Framework Documentation](https://storybook.js.org/docs/configure/integration/frameworks)
- [Astro Container API](https://docs.astro.build/en/reference/container-reference/)

## License

MIT
