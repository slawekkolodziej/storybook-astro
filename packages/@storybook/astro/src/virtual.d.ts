import type { RenderComponentInput } from './types.ts';

declare module 'virtual:astro-container-renderers' {
  import type { experimental_AstroContainer as AstroContainer } from 'astro/container';

  export function addRenderers(container: AstroContainer): void;
  export function resolveClientModules(specifier: string): string | undefined;
}

declare module 'virtual:storybook-astro-renderer' {
  export function init(): void;
  export function render(data: RenderComponentInput): void;

  type ApplyStylesFunc = () => void;
  export const applyStyles = ApplyStylesFunc | undefined;
}

declare module 'virtual:storybook-renderer-fallback' {}

declare module 'virtual:storybook-astro-sanitization-config' {
  import type { SanitizationOptions } from './sanitization.ts';

  const sanitization: SanitizationOptions | undefined;

  export default sanitization;
}
