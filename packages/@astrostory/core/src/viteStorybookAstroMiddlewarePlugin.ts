import { fileURLToPath } from 'node:url';
import { createServer, normalizePath, type PluginOption, type ViteDevServer } from 'vite';
import type { RenderRequestMessage, RenderResponseMessage } from '@astrostory/renderer/types';
import type { FrameworkOptions } from './types.ts';
import type { Integration } from './integrations/index.ts';
import { viteAstroContainerRenderersPlugin } from './viteAstroContainerRenderersPlugin.ts';
import { resolveMswConfigFilePath } from './msw-options.ts';

export async function createStorybookAstroMiddlewarePlugin(options: FrameworkOptions) {
  const viteServer = await createViteServer(options.integrations);

  const vitePlugin = {
    name: 'storybook-astro:middleware',
    async configureServer(server) {
      const filePath = fileURLToPath(new URL('./middleware', import.meta.url));
      const middleware = await viteServer.ssrLoadModule(filePath, {
        fixStacktrace: true
      });
      const mswConfigFilePath = resolveMswConfigFilePath(options.msw);
      let mswConfigModule = await loadMswConfigModule(viteServer, mswConfigFilePath);

      const handler = await middleware.handlerFactory(options.integrations, () => mswConfigModule);

      if (mswConfigFilePath) {
        const normalizedMswConfigPath = normalizePath(mswConfigFilePath);

        server.watcher.add(mswConfigFilePath);

        const refreshMswConfigModule = async (action: 'change' | 'unlink') => {
          try {
            if (action === 'unlink') {
              mswConfigModule = undefined;
            } else {
              mswConfigModule = await loadMswConfigModule(viteServer, mswConfigFilePath, {
                invalidate: true
              });
            }
          } catch (error) {
            console.error('Failed to reload MSW config module:', error);
          }
        };

        server.watcher.on('change', (changedPath) => {
          if (normalizePath(changedPath) !== normalizedMswConfigPath) {
            return;
          }

          void refreshMswConfigModule('change');
        });

        server.watcher.on('unlink', (changedPath) => {
          if (normalizePath(changedPath) !== normalizedMswConfigPath) {
            return;
          }

          void refreshMswConfigModule('unlink');
        });

        server.watcher.on('add', (changedPath) => {
          if (normalizePath(changedPath) !== normalizedMswConfigPath) {
            return;
          }

          void refreshMswConfigModule('change');
        });
      }

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

  const assetServingPlugin = {
    name: 'storybook-astro:assets',
    configureServer(server) {
      server.middlewares.use('/_image', (req, res, next) => {
        viteServer.middlewares.handle(req, res, (err: unknown) => {
          if (err) {
            console.error('Asset serving error:', err);
            next();
          }
        });
      });
    }
  } satisfies PluginOption;

  return {
    vitePlugin,
    viteConfig: {
      plugins: [
        viteServer.config.plugins.find((plugin) => plugin.name === 'vite:css'),
        viteServer.config.plugins.find((plugin) => plugin.name === 'vite:css-post'),
        assetServingPlugin
      ].filter(Boolean)
    }
  };
}

export const vitePluginStorybookAstroMiddleware = createStorybookAstroMiddlewarePlugin;

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
    plugins: [
      ...(config.plugins?.filter(Boolean) ?? []),
      viteAstroContainerRenderersPlugin(integrations, {
        mode: 'development'
      })
    ]
  });

  return viteServer;
}

async function loadMswConfigModule(
  viteServer: ViteDevServer,
  configFilePath?: string,
  options?: { invalidate?: boolean }
) {
  if (!configFilePath) {
    return undefined;
  }

  if (options?.invalidate) {
    const modules = viteServer.moduleGraph.getModulesByFile(configFilePath);

    modules?.forEach((module) => {
      viteServer.moduleGraph.invalidateModule(module);
    });
  }

  try {
    return await viteServer.ssrLoadModule(configFilePath, {
      fixStacktrace: true
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);

    throw new Error(
      `Unable to load framework.options.msw config module at ${configFilePath}: ${reason}`
    );
  }
}
