import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'vite';
import { mergeWithAstroConfig } from './vitePluginAstro';
import { viteAstroContainerRenderersPlugin } from './viteAstroContainerRenderersPlugin';
import type { FrameworkOptions } from './types.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runAstroServerBuild(options: {
  astroComponents: string[];
  integrations: FrameworkOptions['integrations'];
  outDir: string;
}) {
  // Build configuration that matches your vite.config.ts
  const buildConfig = {
    root: path.resolve(dirname, './server'),
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
        input: path.resolve(dirname, './server/index.ts'),
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
