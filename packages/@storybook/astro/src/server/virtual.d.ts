declare module 'virtual:astro-files' {
  const astroFiles: Record<string, unknown>;

  export default astroFiles;
}

declare module 'virtual:astro-container-renderers' {
  import type { experimental_AstroContainer as AstroContainer } from 'astro/container';

  export function addRenderers(container: AstroContainer): void;
  export function resolveClientModules(specifier: string): string | undefined;
}

declare module 'virtual:storybook-astro-sanitization-config' {
  import type { SanitizationOptions } from '../sanitization.ts';

  const sanitization: SanitizationOptions | undefined;

  export default sanitization;
}
