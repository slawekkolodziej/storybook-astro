import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import astroFiles from 'virtual:astro-files';
import { addRenderers, resolveClientModules } from 'virtual:astro-container-renderers';

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

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT || 3000;

  console.log(`Starting Astro Storybook server on port ${port}...`);

  // Use Hono's Node.js adapter
  const { serve } = await import('@hono/node-server');

  serve({
    fetch: app.fetch,
    port: Number(port)
  });

  console.log(`Server running at http://localhost:${port}`);
}
async function handlerFactory() {
  const container = await AstroContainer.create({
    // Somewhat hacky way to force client-side Storybook's Vite to resolve modules properly
    // resolve: async (s) => {
    //   if (s.startsWith('astro:scripts')) {
    //     return `/${s.replace('astro:scripts', 'astro-scripts')}`;
    //   }
    //   const resolution = resolveClientModules(s);
    //   if (resolution) {
    //     return resolution;
    //   }
    //   return s;
    // }
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
