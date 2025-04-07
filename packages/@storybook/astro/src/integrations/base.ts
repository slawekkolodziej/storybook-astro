import type { AstroIntegration } from 'astro';
import type { RenderContext } from 'storybook/internal/types';

export type RendererDeclaration = {
  server?: {
    name: string,
    entrypoint: string,
  },
  client?: {
    name: string,
    entrypoint: string,
  }
};

export abstract class Integration {
  abstract readonly name: string;
  abstract readonly dependencies: string[];
  abstract readonly options: Record<string | number | symbol, unknown>;
  abstract readonly renderer: RendererDeclaration;

  abstract resolveClient(moduleName: string): string | undefined;
  abstract loadIntegration(): Promise<AstroIntegration>;
  abstract renderToCanvas(ctx: RenderContext, element: HTMLElement): Promise<void>;
} 