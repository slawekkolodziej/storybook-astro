import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import astroFiles from 'virtual:astro-files';
import sanitization from 'virtual:storybook-astro-sanitization-config';
import { addRenderers, resolveClientModules } from 'virtual:astro-container-renderers';
import storyRulesConfigModule, {
  storybookAstroStoryRulesConfigFilePath
} from 'virtual:storybook-astro-story-rules-config';
import { resolveStoryModuleMock, withStoryModuleMocks } from '../module-mocks.ts';
import { applyMswHandlers } from '../msw.ts';
import { selectStoryRules } from '../rules.ts';
import { resolveSanitizationOptions, sanitizeRenderPayload } from '../sanitization.ts';
import { createAuthMiddleware, resolveAuthConfig } from './auth.ts';
import type { HandlerProps } from '../middleware.ts';

const app = new Hono();
const authConfig = resolveAuthConfig();
const rendererHandlerPromise = handlerFactory();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization']
  })
);

app.use('*', createAuthMiddleware(authConfig));

app.get('/', async (c) => c.text('OK'));

app.post('/render', async (c) => {
  const data = (await c.req.json()) || {};
  const rendererHandler = await rendererHandlerPromise;

  const html = await rendererHandler({
    component: data.component,
    args: data.args || {},
    slots: data.slots || {},
    story: data.story
  });

  return c.text(html);
});

export default app;

// Export the app for external server setup
// The server startup will be handled by a separate script
async function handlerFactory() {
  const container = await AstroContainer.create({
    resolve: async (specifier) => {
      const mockedModule = resolveStoryModuleMock(specifier);

      if (mockedModule) {
        return mockedModule;
      }

      const resolution = resolveClientModules(specifier);

      if (resolution) {
        return resolution;
      }

      return specifier;
    }
  });

  addRenderers(container);
  const sanitizationOptions = resolveSanitizationOptions(sanitization ?? undefined);
  let renderQueue = Promise.resolve<void>(undefined);

  return async function handler(data: HandlerProps) {
    const executeRender = async () => {
      const selectedRules = await selectStoryRules({
        configModule: storyRulesConfigModule,
        configFilePath: storybookAstroStoryRulesConfigFilePath,
        mode: 'production',
        story: data.story
      });

      await applyMswHandlers(selectedRules.mswHandlers);

      return withStoryModuleMocks(selectedRules.moduleMocks, async () => {
        const Component = astroFiles[data.component] as Parameters<
          typeof container.renderToString
        >[0];
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
      });
    };

    const resultPromise = renderQueue.then(executeRender, executeRender);

    renderQueue = resultPromise.then(
      () => undefined,
      () => undefined
    );

    return resultPromise;
  };
}
