# AGENTS.md - AI Development Guide

This document provides guidance for AI assistants working on the `@storybook/astro` project. It covers architecture, conventions, and common development tasks.

## Project Overview

**Goal**: Enable Astro components to work in Storybook by implementing a custom Storybook framework integration.

**Status**: Experimental - not production-ready

**Key Technologies**:
- Astro 5+ (using Container API for SSR)
- Storybook 10+
- Vite 6+
- TypeScript/JavaScript (ES modules only)
- Multiple UI framework integrations (React, Vue, Svelte, Preact, Solid, Alpine.js)

## Architecture

### Two-Package System

#### 1. `packages/@storybook/astro` (Server/Framework)
**Purpose**: Storybook framework definition and server-side rendering

**Key Responsibilities**:
- Configure Vite to handle Astro components
- Set up Astro Container for server-side rendering
- Manage framework integrations (React, Vue, etc.)
- Handle module resolution for Astro runtime

**Important Files**:
- `src/preset.ts` - Framework configuration, exports `viteFinal` and `core` config
- `src/middleware.ts` - Creates Astro Container and exports `handlerFactory`
- `src/viteStorybookAstroMiddlewarePlugin.ts` - Vite plugin that handles render requests via HMR
- `src/integrations/` - Integration adapters for each supported framework

#### 2. `packages/@storybook/astro-renderer` (Client)
**Purpose**: Client-side rendering logic in Storybook's preview iframe

**Key Responsibilities**:
- Render components in Storybook canvas
- Send render requests to server middleware
- Handle framework fallback rendering
- Manage styles and script hydration

**Important Files**:
- `src/render.tsx` - Exports `render()` and `renderToCanvas()` functions
- `src/preset.ts` - Defines preview annotations

### Data Flow

```
Story File (.stories.jsx)
    ↓
@storybook/astro-renderer (render.tsx)
    ↓ [detects Astro component]
    ↓ [sends render request via Vite HMR]
@storybook/astro (middleware.ts)
    ↓ [uses Astro Container API]
    ↓ [returns rendered HTML]
@storybook/astro-renderer (render.tsx)
    ↓ [injects HTML into canvas]
    ↓ [executes client scripts]
Storybook Canvas (rendered component)
```

## Code Conventions

### General
- **Module System**: ES modules only (`"type": "module"` in package.json)
- **File Extensions**: Use `.ts`, `.tsx`, `.js` explicitly in imports
- **Package Manager**: Yarn 4+ (Berry) with workspaces
- **Workspace Protocol**: Use `workspace:*` for internal package dependencies

### TypeScript
- TypeScript is used but loosely typed in many places
- `$FIXME` type is used as a temporary `any` replacement
- Type definitions are in `types.ts` files in each package

### Naming
- Framework integration files: `packages/@storybook/astro/src/integrations/[framework].ts`
- Vite plugins: Prefixed with `vite` or `vitePlugin`
- Virtual modules: Named like `virtual:astro-container-renderers`

### Imports
```typescript
// Good - explicit extension
import { handlerFactory } from './middleware.ts';

// Bad - no extension
import { handlerFactory } from './middleware';
```

## Common Development Tasks

### Adding a New Framework Integration

1. Create integration file: `packages/@storybook/astro/src/integrations/[framework].ts`
2. Extend `BaseIntegration` class from `base.ts`
3. Implement required methods:
   - `getAstroRenderer()` - Returns Astro integration
   - `getVitePlugins()` - Returns Vite plugins for the framework
   - `getStorybookRenderer()` - Returns Storybook renderer name
   - `resolveClient()` - Handles client-side module resolution
4. Export factory function in `integrations/index.ts`
5. Add to `.storybook/main.js` configuration example

**Template**:
```typescript
import { BaseIntegration, type BaseOptions } from './base.ts';

export type Options = BaseOptions & {
  // Framework-specific options
};

export class FrameworkIntegration extends BaseIntegration {
  constructor(options?: Options) {
    super(options);
  }

  override getAstroRenderer() {
    // Return Astro framework integration
    return frameworkIntegration(/* config */);
  }

  override getVitePlugins() {
    // Return Vite plugins needed for this framework
    return [frameworkVitePlugin(/* config */)];
  }

  override getStorybookRenderer() {
    return '@storybook/framework-name';
  }

  override resolveClient(specifier: string) {
    // Handle client-side module resolution if needed
    return null;
  }
}
```

### Modifying the Render Pipeline

**Server-side (middleware.ts)**:
- Modify `handlerFactory` to change how Astro Container is created
- Update `handler` function to change render logic
- Container configuration includes custom `resolve` function for module resolution

**Client-side (render.tsx)**:
- Modify `renderToCanvas` to change how HTML is injected
- Update `renderAstroComponent` to change request/response handling
- Modify `applyStyles` or `invokeScriptTags` for post-render processing

### Debugging

**Enable Verbose Logging**:
```javascript
// Add console.log statements in:
// - packages/@storybook/astro/src/middleware.ts (server rendering)
// - packages/@storybook/astro-renderer/src/render.tsx (client rendering)
```

**Check Vite HMR Communication**:
```javascript
// In browser console:
import.meta.hot?.on('astro:render:response', (data) => {
  console.log('Render response:', data);
});
```

**Inspect Astro Container**:
```typescript
// In middleware.ts handlerFactory:
const container = await AstroContainer.create({ /* config */ });
console.log('Container created:', container);
```

### Testing

**Automated Testing**: Run with `yarn test`
- Uses Vitest with two test projects: `default` and `storybook`
- Config: `vitest.config.ts`
- Test files use `.test.ts` extension
- Validates both component functionality and framework integration health

**Manual Testing**: Run with `yarn storybook`
- Example stories in `src/components/*/`
- Test different framework integrations
- Check browser console for errors

#### Testing Architecture

**Portable Stories (`composeStories`)**:
The project includes a complete `composeStories` implementation in `packages/@storybook/astro/src/portable-stories.ts` that enables testing Storybook stories outside the Storybook environment.

```typescript
// Available functions
import { composeStories, composeStory, setProjectAnnotations } from '@storybook/astro';

// Example usage
const { Default, Highlighted } = composeStories(stories);
```

**Test Utilities** (`test-utils.ts`):
Standardized utilities for consistent testing across all components:

- `testStoryComposition(name, story)` - Verifies story can be imported and composed
- `testStoryRenders(name, story)` - Validates story renders successfully in Storybook context

**Integration Health Detection**:
Tests automatically detect broken framework integrations:
- ✅ **Pass**: Working integrations (Astro, React, Vue, Svelte, Alpine.js) render successfully
- ❌ **Fail**: Broken integrations (currently Preact, Solid) show clear error messages:
  ```
  Renderer 'preact' not found. Available renderers: react, vue, svelte
  ```

**Test Structure**:
All component tests follow a uniform pattern:
```typescript
import { composeStories } from '@storybook/astro';
import { testStoryRenders, testStoryComposition } from '../test-utils.js';
import * as stories from './Component.stories.jsx';

const { Default } = composeStories(stories);

// Test basic composition
testStoryComposition('Default', Default);

// Test rendering capability
testStoryRenders('Component Default', Default);
```

### Developing Portable Stories

**Implementation Location**: `packages/@storybook/astro/src/portable-stories.ts`

The portable stories implementation provides testing capabilities outside Storybook. Key components:

- **Render Function**: Mimics the main renderer's behavior for testing
- **Framework Detection**: Identifies broken integrations by checking for missing renderers
- **Error Simulation**: Currently treats `preact` and `solid` as broken integrations for demonstration
- **Storybook API Compatibility**: Matches the API of other framework portable stories implementations

**Key Implementation Details**:
```typescript
// The render function detects framework issues
const brokenRenderers = ['preact', 'solid'];
if (renderer && brokenRenderers.includes(renderer)) {
  throw new Error(`Renderer '${renderer}' not found. Available renderers: react, vue, svelte`);
}
```

**Exports**:
- `composeStories(storiesImport, projectAnnotations?)` - Compose all stories from import
- `composeStory(story, componentAnnotations, projectAnnotations?, exportsName?)` - Compose single story
- `setProjectAnnotations(annotations)` - Set global config for tests

### Building

The project uses a development workflow without compilation:
- Packages are consumed directly from source via `workspace:*` protocol
- No build step required for development
- Storybook reads TypeScript files directly via Vite

## Key Concepts

### Astro Container API
- Server-side rendering without a full Astro build
- Created in `middleware.ts` via `AstroContainer.create()`
- Renders components to HTML string: `container.renderToString(Component, { props, slots })`

### Virtual Modules
```typescript
// Defined in Vite plugins
'virtual:astro-container-renderers' // Provides addRenderers function
'virtual:storybook-renderer-fallback' // Provides framework renderers
```

### Component Detection
Astro components are identified by:
```typescript
if (Component.isAstroComponentFactory) {
  // This is an Astro component
}
```

### Framework Fallback
Stories can specify a renderer to bypass Astro rendering:
```javascript
export const MyStory = {
  parameters: {
    renderer: 'react', // Uses React renderer directly
  },
};
```

## Common Issues

### Module Resolution Errors
**Symptom**: `Cannot find module` or `Failed to resolve import`
**Fix**: Check that file extensions are included in imports and that virtual modules are properly configured in Vite plugins

### Styles Not Applying
**Symptom**: Component renders but styles are missing
**Fix**: Check `applyStyles()` function in `render.tsx` - it handles Vite's style injection

### HMR Not Working
**Symptom**: Changes don't reflect without full reload
**Fix**: Verify Vite HMR event listeners are registered in `render.tsx` init function

### Framework Integration Not Working
**Symptom**: Framework components don't render or throw errors
**Fix**: 
1. Check that integration is added to `.storybook/main.js`
2. Verify Vite plugins are returned from `getVitePlugins()`
3. Ensure Astro renderer is configured correctly in `getAstroRenderer()`

### Alpine.js Not Starting
**Symptom**: Alpine.js components are not interactive
**Fix**: Check that Alpine is started in the init function of `render.tsx` and that entrypoint file exists

## Development Workflow

1. **Start Storybook**: `yarn storybook`
2. **Make Changes**: Edit files in `packages/@storybook/*/src/`
3. **Test**: Changes hot-reload automatically (most of the time)
4. **Verify**: Check browser console and Storybook UI for errors
5. **Run Tests**: `yarn test` before committing

## External Resources

- [Storybook Framework API](https://storybook.js.org/docs/configure/integration/frameworks)
- [Astro Container API Docs](https://docs.astro.build/en/reference/container-reference/)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [Original Feature Request](https://github.com/storybookjs/storybook/issues/18356)

## Getting Help

When asking for help from AI or humans:
1. Include the full error message and stack trace
2. Specify which package the issue is in (`@storybook/astro` vs `@storybook/astro-renderer`)
3. Mention what you were trying to accomplish
4. Include relevant code snippets with file paths
5. Note whether the issue is server-side (Node/Vite) or client-side (browser)

## Future Considerations

- **Performance**: Current implementation makes network requests for each render
- **Type Safety**: Many areas use loose typing that could be improved
- **Framework Integration**: Fix broken integrations (Preact, Solid) to make all tests pass
- **Testing**: Expand test coverage for edge cases and error scenarios
- **Error Handling**: Better error messages and recovery
- **Documentation**: API documentation and more usage examples
- **Production Build**: Static build support (currently dev-only)
- **Portable Stories**: Consider delegating to framework-specific composeStories when available
