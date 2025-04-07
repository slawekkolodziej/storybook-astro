import { dirname, join } from "node:path";
import type { StorybookConfigVite, FrameworkOptions } from "./types";
import { vitePluginStorybookAstroMiddleware } from "./viteStorybookAstroMiddlewarePlugin";
import { mergeWithAstroConfig } from "./vitePluginAstro";
import { react, solid, svelte, vue, preact, alpinejs } from "./integrations";

const getAbsolutePath = <I extends string>(input: I): I =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dirname(require.resolve(join(input, "package.json"))) as any;

export const core = {
  builder: getAbsolutePath("@storybook/builder-vite"),
  renderer: getAbsolutePath("@storybook/astro-renderer"),
};

export const viteFinal: StorybookConfigVite["viteFinal"] = async (
  config,
  { presets }
) => {
  const integrations = [
    react({
      include: ['**/react/*'],
    }),
    solid({
      include: ['**/solid/*'],
    }),
    preact({
      include: ['**/preact/*'],
    }),
    vue(),
    svelte(),
    alpinejs(),
  ];

  const options = await presets.apply<FrameworkOptions>("frameworkOptions");
  const { vitePlugin: storybookAstroMiddlewarePlugin, viteConfig } =
    await vitePluginStorybookAstroMiddleware(options, integrations);

  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push(storybookAstroMiddlewarePlugin, ...viteConfig.plugins);

  const finalConfig = await mergeWithAstroConfig(config, integrations);

  return finalConfig;
};
