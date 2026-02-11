import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import astroFiles from 'virtual:astro-files';
import sanitization from 'virtual:storybook-astro-sanitization-config';
import { addRenderers, resolveClientModules } from 'virtual:astro-container-renderers';
import { resolveSanitizationOptions, sanitizeRenderPayload } from '../sanitization.ts';

const app = new Hono();
const rendererHandlerPromise = handlerFactory();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type']
  })
);

app.get('/', async (c) => c.text('OK'));

app.post('/render', async (c) => {
  const data = (await c.req.json()) || {};
  const rendererHandler = await rendererHandlerPromise;

  const html = await rendererHandler({
    component: data.component,
    args: data.args || {},
    slots: data.slots || {}
  });

  return c.text(html);
});

export default app;

async function handlerFactory() {
  const container = await AstroContainer.create({
    resolve: async (specifier) => {
      const resolution = resolveClientModules(specifier);

      if (resolution) {
        return resolution;
      }

      return specifier;
    }
  });

  addRenderers(container);

  const sanitizationOptions = resolveSanitizationOptions(sanitization ?? undefined);

  return async function handler(data: {
    component: string;
    args?: Record<string, unknown>;
    slots?: Record<string, unknown>;
  }) {
    const Component = astroFiles[data.component];
    const sanitizedPayload = sanitizeRenderPayload(
      {
        args: data.args ?? {},
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
