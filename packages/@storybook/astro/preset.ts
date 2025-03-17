import { dirname, join } from "node:path";
import type { StorybookConfigVite, FrameworkOptions } from "./types";
import { vitePluginStorybookAstroMiddleware } from "./viteStorybookAstroMiddlewarePlugin";
import { mergeWithAstroConfig } from "./vitePluginAstro";

const getAbsolutePath = <I extends string>(input: I): I =>
  dirname(require.resolve(join(input, "package.json"))) as any;

export const core = {
  builder: getAbsolutePath("@storybook/builder-vite"),
  renderer: getAbsolutePath("@storybook/astro-renderer"),
};

export const viteFinal: StorybookConfigVite["viteFinal"] = async (
  config,
  { presets }
) => {
  const options = await presets.apply<FrameworkOptions>("frameworkOptions");
  const storybookAstroMiddlewarePlugin =
    await vitePluginStorybookAstroMiddleware(options);

  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push(storybookAstroMiddlewarePlugin);

  const finalConfig = await mergeWithAstroConfig(config);

  return finalConfig
};
