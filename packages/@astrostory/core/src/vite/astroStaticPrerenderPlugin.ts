import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Dirent } from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createServer, mergeConfig, type Rollup } from 'vite';
import type { FrameworkOptions } from '../types.ts';
import { resolveSanitizationOptions, sanitizeRenderPayload } from '../sanitization.ts';

const PRERENDERED_STORIES_FILE = 'astro-prerendered-stories.json';

type StoryIndex = {
  entries?: Record<
    string,
    {
      type?: string;
      id?: string;
      importPath?: string;
      exportName?: string;
      componentPath?: string;
    }
  >;
};

type StoryEntry = {
  id: string;
  importPath: string;
  exportName: string;
};

export function astroStaticPrerenderPlugin(options: {
  integrations: FrameworkOptions['integrations'];
  sanitization?: FrameworkOptions['sanitization'];
  outDir: string;
}) {
  const trackedSpecifiers = collectTrackedSpecifiers(options.integrations);
  const staticEntrypointRefs = new Map<string, string>();
  const componentEntrypointRefs = new Map<string, string>();

  return [
    {
      name: 'storybook-astro:static-prerender-module-map',
      resolveId(id: string) {
        if (id.startsWith('virtual:astro-static-module/')) {
          return `\0${id}`;
        }

        if (id.startsWith('virtual:astro-component-module/')) {
          return `\0${id}`;
        }
      },
      load(id: string) {
        if (id.startsWith('\0virtual:astro-static-module/')) {
          const encodedSpecifier = id.replace('\0virtual:astro-static-module/', '');
          const specifier = decodeURIComponent(encodedSpecifier);

          if (isClientEntrypoint(specifier)) {
            return [
              `export { default } from '${specifier}';`,
              `export * from '${specifier}';`
            ].join('\n');
          }

          return [`import '${specifier}';`, 'export default undefined;'].join('\n');
        }

        if (id.startsWith('\0virtual:astro-component-module/')) {
          const encodedSpecifier = id.replace('\0virtual:astro-component-module/', '');
          const specifier = decodeURIComponent(encodedSpecifier);

          return [`export { default } from '${specifier}';`, `export * from '${specifier}';`].join(
            '\n'
          );
        }
      },
      async buildStart(this: Rollup.PluginContext) {
        options.integrations.forEach((integration) => {
          const entrypoint = integration.renderer?.client?.entrypoint;

          if (entrypoint) {
            this.addWatchFile(entrypoint);
          }
        });

        trackedSpecifiers.forEach((specifier) => {
          const virtualId = toStaticVirtualId(specifier);
          const fileReferenceId = this.emitFile({
            type: 'chunk',
            id: virtualId
          });

          staticEntrypointRefs.set(specifier, fileReferenceId);
        });

        const srcRoot = resolve(process.cwd(), 'src/components');
        const specifiers = await collectHydratableSourceModules(srcRoot);

        specifiers.forEach((specifier) => {
          const virtualId = toComponentVirtualId(specifier);
          const fileReferenceId = this.emitFile({
            type: 'chunk',
            id: virtualId
          });

          componentEntrypointRefs.set(specifier, fileReferenceId);
        });
      }
    },
    {
      name: 'storybook-astro:static-prerender-stories',
      async writeBundle(this: Rollup.PluginContext) {
        const staticModuleMap = buildStaticModuleMap(
          this,
          staticEntrypointRefs,
          componentEntrypointRefs
        );

        const stories = await collectAstroStories(options.outDir);

        if (stories.length === 0) {
          await writePrerenderedStoriesFile(options.outDir, {});

          return;
        }

        const prerenderedStories = await prerenderStories({
          stories,
          integrations: options.integrations,
          sanitization: options.sanitization,
          staticModuleMap,
          trackedSpecifiers
        });

        await writePrerenderedStoriesFile(options.outDir, prerenderedStories);
      }
    }
  ] as const;
}

async function writePrerenderedStoriesFile(outDir: string, payload: Record<string, string>) {
  const source = JSON.stringify(payload);

  await mkdir(outDir, { recursive: true });
  await writeFile(resolve(outDir, PRERENDERED_STORIES_FILE), source, 'utf-8');
}

async function prerenderStories(options: {
  stories: StoryEntry[];
  integrations: FrameworkOptions['integrations'];
  sanitization?: FrameworkOptions['sanitization'];
  staticModuleMap: Record<string, string>;
  trackedSpecifiers: Set<string>;
}) {
  const sanitizationOptions = resolveSanitizationOptions(options.sanitization ?? undefined);
  const resolvedClientModule = createClientModuleResolver(
    options.integrations,
    options.staticModuleMap
  );
  const viteServer = await createStorySsrServer(options.integrations, options.trackedSpecifiers);

  try {
    const container = await AstroContainer.create({
      resolve: async (specifier) => {
        const resolution = resolvedClientModule(specifier);

        if (resolution) {
          return resolution;
        }

        return specifier;
      }
    });

    await addContainerRenderers(container, options.integrations, resolvedClientModule, viteServer);

    const output: Record<string, string> = {};

    for (const story of options.stories) {
      const modulePath = resolveImportPath(story.importPath);
      const storyModule = await viteServer.ssrLoadModule(modulePath);
      const meta = storyModule.default;
      const storyExport = storyModule[story.exportName];

      if (!meta?.component) {
        throw new Error(
          `Unable to prerender story "${story.id}". Missing default export component in ${story.importPath}.`
        );
      }

      const mergedArgs = mergeStoryArgs(meta.args, storyExport?.args);
      const { args, slots } = separateSlots(mergedArgs);
      const sanitizedPayload = sanitizeRenderPayload({ args, slots }, sanitizationOptions);

      output[story.id] = await container.renderToString(meta.component, {
        props: sanitizedPayload.args,
        slots: sanitizedPayload.slots
      });
    }

    return output;
  } finally {
    await viteServer.close();
  }
}

async function createStorySsrServer(
  integrations: FrameworkOptions['integrations'],
  trackedSpecifiers: Set<string>
) {
  const { getViteConfig } = await import('astro/config');
  const astroConfig = await getViteConfig(
    {},
    {
      configFile: false,
      integrations: await Promise.all(
        integrations.map((integration) => integration.loadIntegration())
      )
    }
  )({
    mode: 'production',
    command: 'serve'
  });

  const config = mergeConfig(astroConfig, {
    appType: 'custom',
    server: {
      middlewareMode: true
    },
    plugins: [
      {
        name: 'storybook-astro:static-prerender-ssr-stubs',
        resolveId(id: string) {
          if (trackedSpecifiers.has(id)) {
            return `\0storybook-astro-static-prerender-stub:${encodeURIComponent(id)}`;
          }
        },
        load(id: string) {
          if (id.startsWith('\0storybook-astro-static-prerender-stub:')) {
            return 'export default undefined;';
          }
        }
      }
    ]
  });

  return createServer(config);
}

async function addContainerRenderers(
  container: Awaited<ReturnType<typeof AstroContainer.create>>,
  integrations: FrameworkOptions['integrations'],
  resolveClientModule: (specifier: string) => string | undefined,
  viteServer: Awaited<ReturnType<typeof createStorySsrServer>>
) {
  for (const integration of integrations) {
    const serverRenderer = integration.renderer.server;

    if (serverRenderer) {
      const serverRendererModule = await viteServer.ssrLoadModule(serverRenderer.entrypoint);
      const renderer = serverRendererModule.default ?? serverRendererModule;

      container.addServerRenderer({
        name: serverRenderer.name,
        renderer:
          integration.name === 'solid'
            ? {
                ...renderer,
                name: serverRenderer.name
              }
            : renderer
      });
    }

    const clientRenderer = integration.renderer.client;

    if (clientRenderer) {
      const resolvedEntrypoint =
        resolveClientModule(clientRenderer.entrypoint) ?? clientRenderer.entrypoint;

      container.addClientRenderer({
        name: clientRenderer.name,
        entrypoint: resolvedEntrypoint
      });
    }
  }
}

function createClientModuleResolver(
  integrations: FrameworkOptions['integrations'],
  staticModuleMap: Record<string, string>
) {
  return function resolveClientModule(specifier: string) {
    if (Object.hasOwn(staticModuleMap, specifier)) {
      return staticModuleMap[specifier];
    }

    const normalizedSpecifier = specifier.replace(/\\/g, '/').replace(/\?.*$/, '');

    if (Object.hasOwn(staticModuleMap, normalizedSpecifier)) {
      return staticModuleMap[normalizedSpecifier];
    }

    for (const integration of integrations) {
      const resolution = integration.resolveClient(specifier);

      if (resolution) {
        return resolution;
      }
    }
  };
}

async function collectAstroStories(outDir: string): Promise<StoryEntry[]> {
  const indexFile = resolve(outDir, 'index.json');
  const indexRaw = await readFile(indexFile, 'utf-8');
  const indexJson = JSON.parse(indexRaw) as StoryIndex;

  return Object.values(indexJson.entries ?? {})
    .filter((entry) => entry.type === 'story' && entry.componentPath?.endsWith('.astro'))
    .map((entry) => {
      if (!entry.id || !entry.importPath || !entry.exportName) {
        throw new Error(`Encountered an invalid Storybook index entry in ${indexFile}.`);
      }

      return {
        id: entry.id,
        importPath: entry.importPath,
        exportName: entry.exportName
      };
    });
}

function mergeStoryArgs(
  metaArgs: Record<string, unknown> | undefined,
  storyArgs: Record<string, unknown> | undefined
) {
  return {
    ...(metaArgs ?? {}),
    ...(storyArgs ?? {})
  };
}

function separateSlots(inputArgs: Record<string, unknown>) {
  const args = { ...inputArgs };
  const slotsCandidate = args.slots;

  delete args.slots;

  if (!isRecord(slotsCandidate)) {
    return {
      args,
      slots: {}
    };
  }

  return {
    args,
    slots: slotsCandidate as Record<string, string>
  };
}

function resolveImportPath(importPath: string) {
  if (importPath.startsWith('./')) {
    return resolve(process.cwd(), importPath.slice(2));
  }

  return resolve(process.cwd(), importPath);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function collectTrackedSpecifiers(integrations: FrameworkOptions['integrations']) {
  const specifiers = new Set<string>([
    'astro:scripts/page.js',
    'astro:scripts/before-hydration.js'
  ]);

  integrations.forEach((integration) => {
    const entrypoint = integration.renderer?.client?.entrypoint;

    if (entrypoint) {
      specifiers.add(entrypoint);
    }
  });

  return specifiers;
}

function buildStaticModuleMap(
  pluginContext: Rollup.PluginContext,
  staticEntrypointRefs: Map<string, string>,
  componentEntrypointRefs: Map<string, string>
) {
  const map: Record<string, string> = {};

  staticEntrypointRefs.forEach((fileReferenceId, specifier) => {
    const fileName = pluginContext.getFileName(fileReferenceId);

    if (fileName) {
      map[specifier] = toPublicPath(fileName);
    }
  });

  componentEntrypointRefs.forEach((fileReferenceId, specifier) => {
    const fileName = pluginContext.getFileName(fileReferenceId);

    if (fileName) {
      map[specifier] = toPublicPath(fileName);
    }
  });

  return map;
}

function toStaticVirtualId(specifier: string) {
  return `virtual:astro-static-module/${encodeURIComponent(specifier)}`;
}

function toComponentVirtualId(specifier: string) {
  return `virtual:astro-component-module/${encodeURIComponent(specifier)}`;
}

function isClientEntrypoint(specifier: string) {
  return specifier.startsWith('@astrojs/') && specifier.endsWith('/client.js');
}

function toPublicPath(fileName: string) {
  return `./${fileName}`;
}

async function collectHydratableSourceModules(srcRoot: string): Promise<string[]> {
  const { readdir } = await import('node:fs/promises');

  const modules: string[] = [];

  async function walk(directory: string) {
    let entries: Dirent[];

    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    await Promise.all(
      entries.map(async (entry) => {
        const absolutePath = resolve(directory, entry.name);

        if (entry.isDirectory()) {
          await walk(absolutePath);

          return;
        }

        if (!entry.isFile()) {
          return;
        }

        const normalizedPath = absolutePath.replace(/\\/g, '/');

        if (!isHydratableSourceFile(normalizedPath)) {
          return;
        }

        if (isNonHydratableSourceFile(normalizedPath)) {
          return;
        }

        modules.push(normalizedPath);
      })
    );
  }

  await walk(srcRoot);

  return modules;
}

function isHydratableSourceFile(input: string) {
  return /\.(jsx|tsx|vue|svelte|js|ts)$/.test(input);
}

function isNonHydratableSourceFile(input: string) {
  return /\.stories\.[jt]sx?$|\.stories\.vue$|\.stories\.svelte$|\.(spec|test)\.[jt]sx?$/.test(
    input
  );
}
