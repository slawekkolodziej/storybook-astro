import { fileURLToPath } from 'node:url';
import { createServer, type PluginOption } from 'vite';
import type { AstroInlineConfig } from 'astro/config';
import type { RenderRequestMessage, RenderResponseMessage } from '@storybook/astro-renderer/types';
import type { FrameworkOptions, SupportedFramework } from './types';

export async function vitePluginStorybookAstroMiddleware(options: FrameworkOptions) {
  const viteServer = await createViteServer(options.integrations);

  const vitePlugin = {
    name: 'storybook-astro-middleware-plugin',
    async configureServer(server) {
      const filePath = fileURLToPath(new URL('./middleware', import.meta.url));
      const mod = await viteServer.ssrLoadModule(filePath, {
        fixStacktrace: true
      });
      const handler = await mod.handlerFactory(options.integrations);

      server.ws.on('astro:render:request', async (data: RenderRequestMessage['data']) => {
        try {
          const html = await handler(data, options.integrations);

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

export async function createViteServer(integrations: SupportedFramework[]) {
  const { getViteConfig } = await import('astro/config');

  const config = await getViteConfig(
    {},
    {
      integrations: await loadIntegrations(integrations)
    }
  )({ mode: 'development', command: 'serve' });

  const viteServer = await createServer({
    configFile: false,
    ...config,
    plugins: config.plugins?.filter(Boolean)
  });

  return viteServer;
}

export async function loadIntegrations(
  integrations: SupportedFramework[]
): Promise<AstroInlineConfig['integrations']> {
  const frameworkMap = {
    react: '@astrojs/react',
    preact: '@astrojs/preact',
    svelte: '@astrojs/svelte',
    vue: '@astrojs/vue',
    solid: '@astrojs/solid-js'
  };

  return Promise.all(
    integrations
      .map(async (integration) => {
        if (!frameworkMap[integration]) {
          console.error(`Unsupported framework: ${integration}`);

          return null;
        }

        const framework = await import(frameworkMap[integration]);

        if (['solid', 'preact'].includes(integration)) {
          return framework.default({
            // FIXME: Forward JSX frameworks config here
            include: [`**/${integration}/*`]
          });
        }

        return framework.default();
      })
      .filter(Boolean)
  );
}
