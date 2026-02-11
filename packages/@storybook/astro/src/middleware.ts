import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { Integration } from './integrations/index.ts';
import type { SanitizationOptions } from './sanitization.ts';
import { resolveSanitizationOptions, sanitizeRenderPayload } from './sanitization.ts';
import { addRenderers } from 'virtual:astro-container-renderers';

export type HandlerProps = {
  component: string;
  args?: Record<string, unknown>;
  slots?: Record<string, unknown>;
};

export async function handlerFactory(
  integrations: Integration[],
  sanitization?: SanitizationOptions
) {
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

  const sanitizationOptions = resolveSanitizationOptions(sanitization);

  return async function handler(data: HandlerProps) {
    const { default: Component } = await import(/* @vite-ignore */ data.component);
    const processedArgs = await processImageMetadata(data.args ?? {});
    const sanitizedPayload = sanitizeRenderPayload(
      {
        args: processedArgs,
        slots: data.slots ?? {}
      },
      sanitizationOptions
    );

    return container.renderToString(Component, {
      props: sanitizedPayload.args,
      slots: sanitizedPayload.slots
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
