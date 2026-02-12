import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import astroFiles from 'virtual:astro-files';
import { addRenderers, resolveClientModules } from 'virtual:astro-container-renderers';
import mswConfig from 'virtual:storybook-astro-msw-config';
import { startMswServer } from '../msw.ts';

const app = new Hono();
const rendererHandlerPromise = handlerFactory();
const mswServerPromise = startMswServer(mswConfig, 'production');

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
  await mswServerPromise;

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

// Export the app for external server setup
// The server startup will be handled by a separate script
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

  return async function handler(data) {
    const Component = astroFiles[data.component];

    return container.renderToString(Component, {
      props: data.args,
      slots: data.slots ?? {}
    });
  };
}
