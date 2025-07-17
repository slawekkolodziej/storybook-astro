import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import astroFiles from 'virtual:astro-files';
import {
  addRenderers,
  resolveClientModules,
  getScriptContent
} from 'virtual:astro-container-renderers';

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

// Serve Astro scripts
app.get('/astro-scripts/:scriptName', async (c) => {
  const scriptName = c.req.param('scriptName');

  try {
    // Generate script content based on integrations
    const scriptContent = getScriptContent(scriptName);

    if (scriptContent !== undefined) {
      return c.text(scriptContent, 200, {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600'
      });
    } else {
      return c.text('Script not found', 404);
    }
  } catch (error) {
    console.error('Error serving script:', scriptName, error);
    return c.text('// Error loading script', 500, {
      'Content-Type': 'application/javascript'
    });
  }
});
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

// Export the app for external server setup
// The server startup will be handled by a separate script
async function handlerFactory() {
  const container = await AstroContainer.create({
    resolve: async (specifier) => {
      // Handle astro:scripts virtual modules
      if (specifier.startsWith('astro:scripts/')) {
        // Convert to a URL that the client can fetch from our server
        const scriptName = specifier.replace('astro:scripts/', '');
        return `/astro-scripts/${scriptName}`;
      }

      // Handle other client module resolutions
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
