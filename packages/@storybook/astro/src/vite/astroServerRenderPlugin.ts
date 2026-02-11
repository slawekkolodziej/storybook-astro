import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';
import { build, type Rollup } from 'vite';
import type { FrameworkOptions } from '../types';
import { viteAstroContainerRenderersPlugin } from '../viteAstroContainerRenderersPlugin';
import { mergeWithAstroConfig } from '../vitePluginAstro';

const moduleRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function astroServerRenderPlugin(options: {
  integrations: FrameworkOptions['integrations'];
  outDir: string;
}) {
  const storiesMap = new Map<string, Set<string>>();
  const trackedSpecifiers = collectTrackedSpecifiers(options.integrations);
  const staticEntrypointRefs = new Map<string, string>();
  const componentEntrypointRefs = new Map<string, string>();

  return [
    {
      name: 'collect-astro-files',
      enforce: 'pre',
      /**
       * Build a map of files that import *.astro files
       **/
      resolveId(id: string, importer?: string) {
        if (id.endsWith('.astro')) {
          if (importer) {
            const absAstroPath = resolve(dirname(importer), id);

            if (!storiesMap.has(absAstroPath)) {
              storiesMap.set(absAstroPath, new Set());
            }

            storiesMap.get(absAstroPath)!.add(importer);
          }
        }
      }
    },
    {
      name: 'astro-frontend-chunks',
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
      name: 'render-astro-server',

      async writeBundle(
        this: Rollup.PluginContext,
        _outputOptions: Rollup.OutputOptions,
        bundle: Rollup.OutputBundle
      ) {
        const astroComponents = Array.from(storiesMap.keys());
        const staticModuleMap = buildStaticModuleMap(
          this,
          staticEntrypointRefs,
          componentEntrypointRefs
        );

        trackedSpecifiers.forEach((specifier) => {
          if (!staticModuleMap[specifier]) {
            this.warn(
              `Could not resolve static asset for "${specifier}" in Storybook build output.`
            );
          }
        });

        await buildAstroServer({
          integrations: options.integrations,
          astroComponents,
          outDir: options.outDir,
          staticModuleMap
        });
      }
    }
  ] as const;
}

async function buildAstroServer(options: {
  astroComponents: string[];
  integrations: FrameworkOptions['integrations'];
  outDir: string;
  staticModuleMap: Record<string, string>;
}) {
  // Build configuration that matches your vite.config.ts
  const buildConfig = {
    root: resolve(moduleRoot, './server'),
    ssr: {
      noExternal: /(@astrojs\/.+|react|react-dom)/
    },
    build: {
      ssr: true,
      outDir: options.outDir,
      emptyOutDir: true,
      sourcemap: true,
      manifest: false,
      rollupOptions: {
        input: resolve(moduleRoot, './server/index.ts'),
        treeshake: true
      }
    },
    plugins: [
      astroFilesPlugin(options.astroComponents),
      viteAstroContainerRenderersPlugin(options.integrations, {
        mode: 'production',
        staticModuleMap: options.staticModuleMap
      })
    ]
  };

  try {
    console.warn('Starting Astro server build...');
    const finalConfig = await mergeWithAstroConfig(
      buildConfig,
      options.integrations,
      'production',
      'build'
    );

    await build(finalConfig);
    console.warn('Astro server build completed successfully.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
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
  const modules: string[] = [];

  async function walk(directory: string) {
    let entries: Awaited<ReturnType<typeof readdir>>;

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

function astroFilesPlugin(astroComponents: string[]) {
  const name = 'astro-files';
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name,

    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    async load(id: string) {
      if (id === resolvedVirtualModuleId) {
        try {
          const imports = astroComponents.reduce<
            Array<{ id: string; file: string; index: number; importStatement: string }>
          >((acc, file, index) => {
            const moduleId = `_astroFile${index}`;
            const importStatement = `import ${moduleId} from '${file}';`;

            return [
              ...acc,
              {
                id: moduleId,
                file,
                index,
                importStatement
              }
            ];
          }, []);

          return `
            ${imports.map(({ importStatement }) => importStatement).join('\n')}
            export default {
              ${imports.map(({ file, id }) => `'${file}': ${id}`).join(',\n')}
            };
          `;
        } catch (error) {
          console.error('Failed to load astro files:', error);
          process.exit(1);
        }
      }
    }
  };
}
