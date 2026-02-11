import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'vite';
import { mergeWithAstroConfig } from './vitePluginAstro.ts';
import { viteAstroContainerRenderersPlugin } from './viteAstroContainerRenderersPlugin.ts';
import { astroFilesVirtualModulePlugin } from './vite/astroFilesVirtualModulePlugin.ts';
import type { FrameworkOptions } from './types.ts';

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
      astroFilesVirtualModulePlugin(options.astroComponents),
      viteAstroContainerRenderersPlugin(options.integrations, {
        mode: 'production'
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

    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
}
