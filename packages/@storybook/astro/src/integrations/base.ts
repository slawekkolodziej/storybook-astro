import type { AstroIntegration } from 'astro';
import type { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { RenderContext } from 'storybook/internal/types';

export abstract class Integration {
  abstract readonly name: string;
  abstract readonly dependencies: string[];
  abstract readonly options: Record<string | number | symbol, unknown>;
  
  abstract addRenderer(container: AstroContainer): Promise<void>;
  abstract resolveClient(moduleName: string): string | undefined;
  abstract loadIntegration(): Promise<AstroIntegration>;
  abstract renderToCanvas(ctx: RenderContext, element: HTMLElement): Promise<void>;
} 