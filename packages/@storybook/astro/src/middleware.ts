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

    // Process args to convert ImageMetadata objects to usable URLs
    const processedArgs = await processImageMetadata(data.args || {});

    return container.renderToString(Component, {
      props: processedArgs,
      slots: data.slots ?? {}
    });
  };
}

/**
 * Recursively processes arguments to convert ImageMetadata objects to usable image URLs.
 * This allows Astro's Image component to work properly in Storybook by converting
 * optimized asset references to direct file paths.
 */
async function processImageMetadata(args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const processed: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(args)) {
    if (isImageMetadata(value)) {
      // Convert ImageMetadata to a usable URL
      processed[key] = convertImageMetadataToUrl(value);
    } else if (Array.isArray(value)) {
      // Process arrays recursively
      processed[key] = await Promise.all(
        value.map(async (item) => 
          typeof item === 'object' && item !== null 
            ? await processImageMetadata(item as Record<string, unknown>)
            : item
        )
      );
    } else if (typeof value === 'object' && value !== null) {
      // Process nested objects recursively
      processed[key] = await processImageMetadata(value as Record<string, unknown>);
    } else {
      processed[key] = value;
    }
  }
  
  return processed;
}

/**
 * Type guard to check if a value is an ImageMetadata object.
 * ImageMetadata objects typically have properties like src, width, height, format.
 */
function isImageMetadata(value: unknown): value is Record<string, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'src' in value &&
    typeof (value as any).src === 'string' &&
    ('width' in value || 'height' in value || 'format' in value)
  );
}

/**
 * Converts an ImageMetadata object to a usable URL for Storybook.
 * In a Storybook environment, we use the raw file path instead of optimized URLs.
 */
function convertImageMetadataToUrl(imageMetadata: Record<string, any>): string {
  // For Storybook, use the raw src path which should be the file path
  // This bypasses Astro's image optimization which doesn't work in Storybook
  return imageMetadata.src || imageMetadata.fsPath || String(imageMetadata);
}
