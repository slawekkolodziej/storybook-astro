import { fileURLToPath } from 'node:url';
import { createServer, type PluginOption } from 'vite';
// import type { AstroInlineConfig } from 'astro';
import type { RenderRequestMessage, RenderResponseMessage } from '@storybook/astro-renderer/types';
import type { FrameworkOptions, SupportedFramework } from './types';
import type { Integration } from './integrations';

export async function vitePluginStorybookAstroMiddleware(
  options: FrameworkOptions,
  integrations: Integration[]
) {
  const viteServer = await createViteServer(options.integrations, integrations);

  const vitePlugin = {
    name: 'storybook-astro-middleware-plugin',
    async configureServer(server) {
      const filePath = fileURLToPath(new URL('./middleware', import.meta.url));
      const mod = await viteServer.ssrLoadModule(filePath, {
        fixStacktrace: true
      });
      const handler = await mod.handlerFactory(options.integrations, integrations);

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

export async function createViteServer(
  _oldIntegrations: SupportedFramework[],
  integrations: Integration[]
) {
  const { getViteConfig } = await import('astro/config');

  // const mods = await loadIntegrations(integrations, integrations);

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

// export async function loadIntegrations(
//   integrations: SupportedFramework[],
//   integrations2: Integration[]
// ): Promise<AstroInlineConfig['integrations']> {
//   const frameworkMap = {
//     react: '@astrojs/react',
//     preact: '@astrojs/preact',
//     svelte: '@astrojs/svelte',
//     vue: '@astrojs/vue',
//     solid: '@astrojs/solid-js'
//   };

//   return Promise.all(
//     integrations.map(async (integration) => {
//       if (!frameworkMap[integration]) {
//         console.error(`Unsupported framework: ${integration}`);

//         return null;
//       }

//       const framework = await import(frameworkMap[integration]);

//       if (['solid', 'preact'].includes(integration)) {
//         return framework.default({
//           // FIXME: Forward JSX frameworks config here
//           include: [`**/${integration}/*`]
//         });
//       }

//       if (['vue', 'svelte'].includes(integration)) {
//         return framework.default({
//           include: [`*.${integration}`]
//         });
//       }

//       return framework.default();
//     })
//   ).then((result) => result.filter(Boolean));
// }
