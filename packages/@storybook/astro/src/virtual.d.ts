declare module 'virtual:astro-container-renderers' {
  import type { experimental_AstroContainer as AstroContainer } from 'astro/container';

  export function addRenderers(container: AstroContainer): void;
}

declare module 'virtual:storybook-renderer-fallback' {}