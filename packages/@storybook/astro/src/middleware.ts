import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { Integration } from './integrations/index.ts';
import { addRenderers } from 'virtual:astro-container-renderers';

export type HandlerProps = {
  component: string;
  args?: Record<string, unknown>;
  slots?: Record<string, unknown>;
};

export async function handlerFactory(integrations: Integration[]) {
  const container = await AstroContainer.create({
    // Somewhat hacky way to force client-side Storybook's Vite to resolve modules properly
    resolve: async (s) => {
      if (s.startsWith('astro:scripts')) {
        return `/@id/${s}`;
      }

      for (const integration of integrations) {
        const resolution = integration.resolveClient(s);

        if (resolution) {
          return resolution;
        }
      }

      return s;
    }
  });

  addRenderers(container);

  return async function handler(data: HandlerProps) {
    const { default: Component } = await import(/* @vite-ignore */ data.component);
    const processedArgs = await processImageMetadata(data.args ?? {});

    return container.renderToString(Component, {
      props: processedArgs,
      slots: data.slots ?? {}
    });
  };
}

async function processImageMetadata(
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const processed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (isImageMetadata(value)) {
      processed[key] = value.src;
      continue;
    }

    if (Array.isArray(value)) {
      processed[key] = await Promise.all(
        value.map(async (item) => {
          if (isImageMetadata(item)) {
            return item.src;
          }

          if (typeof item === 'object' && item !== null) {
            return processImageMetadata(item as Record<string, unknown>);
          }

          return item;
        })
      );

      continue;
    }

    if (typeof value === 'object' && value !== null) {
      processed[key] = await processImageMetadata(value as Record<string, unknown>);
      continue;
    }

    processed[key] = value;
  }

  return processed;
}

function isImageMetadata(value: unknown): value is { src: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'src' in value &&
    typeof (value as { src: unknown }).src === 'string' &&
    ('width' in value || 'height' in value || 'format' in value)
  );
}
