import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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
      buildStart(this: Rollup.PluginContext) {
        options.integrations.map((integration) => {
          const entrypoint = integration.renderer?.client?.entrypoint;

          if (entrypoint) {
            this.addWatchFile(entrypoint);
          }
        });
        console.log(this);
      }
    },
    {
      name: 'render-astro-server',

      async buildEnd(this: Rollup.PluginContext) {
        const astroComponents = Array.from(storiesMap.keys());

        await buildAstroServer({
          integrations: options.integrations,
          astroComponents,
          outDir: options.outDir
        });
      }
    }
  ] as const;
}

async function buildAstroServer(options: {
  astroComponents: string[];
  integrations: FrameworkOptions['integrations'];
  outDir: string;
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
      viteAstroContainerRenderersPlugin(options.integrations)
    ]
  };

  try {
    // eslint-disable-next-line no-console
    console.info('Starting build...');
    const finalConfig = await mergeWithAstroConfig(
      buildConfig,
      options.integrations,
      'production',
      'build'
    );

    await build(finalConfig);
    // eslint-disable-next-line no-console
    console.info('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

function astroFilesPlugin(astroComponents: string[]) {
  const name = 'astro-files';
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name,

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    async load(id) {
      if (id === resolvedVirtualModuleId) {
        try {
          const imports = astroComponents.reduce((acc, file, index) => {
            const id = `_astroFile${index}`;
            const importStatement = `import ${id} from '${file}';`;

            return [
              ...acc,
              {
                id,
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
