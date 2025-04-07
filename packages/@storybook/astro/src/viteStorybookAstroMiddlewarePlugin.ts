import { fileURLToPath } from 'node:url';
import { createServer, type PluginOption } from 'vite';
import type { RenderRequestMessage, RenderResponseMessage } from '@storybook/astro-renderer/types';
import type { FrameworkOptions } from './types';
import type { Integration } from './integrations';

export async function vitePluginStorybookAstroMiddleware(options: FrameworkOptions) {
  const viteServer = await createViteServer(options.integrations);

  const vitePlugin = {
    name: 'storybook-astro-middleware-plugin',
    async configureServer(server) {
      const filePath = fileURLToPath(new URL('./middleware', import.meta.url));
      const middleware = await viteServer.ssrLoadModule(filePath, {
        fixStacktrace: true
      });
      const loadModule = (filePath: string) =>
        viteServer.ssrLoadModule(filePath, { fixStacktrace: true });
      const handler = await middleware.handlerFactory(options.integrations, loadModule);

      server.ws.on('astro:render:request', async (data: RenderRequestMessage['data']) => {
        try {
          const html = await handler(data);

          server.ws.send('astro:render:response', {
            html,
            id: data.id
          } satisfies RenderResponseMessage['data']);
        } catch (err) {
          console.error(err);
          server.ws.send('astro:render:response', {
            id: data.id,
            html:
              '<div style="background: #d73838; padding: 8px; color: #f0f0f0">' +
              'Error occurred while rendering Astro component' +
              '</div>'
          } satisfies RenderResponseMessage['data']);
        }
      });
    }
  } satisfies PluginOption;

  return {
    vitePlugin,
    viteConfig: {
      plugins: [
        viteServer.config.plugins.find((plugin) => plugin.name === 'vite:css'),
        viteServer.config.plugins.find((plugin) => plugin.name === 'vite:css-post')
      ].filter(Boolean)
    }
  };
}

export async function createViteServer(integrations: Integration[]) {
  const { getViteConfig } = await import('astro/config');

  const config = await getViteConfig(
    {},
    {
      configFile: false,
      integrations: await Promise.all(
        integrations.map((integration) => integration.loadIntegration())
      )
    }
  )({ mode: 'development', command: 'serve' });

  const viteServer = await createServer({
    configFile: false,
    ...config,
    plugins: config.plugins?.filter(Boolean)
  });

  return viteServer;
}
