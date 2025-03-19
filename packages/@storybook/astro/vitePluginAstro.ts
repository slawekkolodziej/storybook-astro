import path from "node:path";
import { transform } from "@astrojs/compiler";
import { mergeConfig, type InlineConfig } from "vite";

const ASTRO_PLUGINS_THAT_ARE_SUPPOSEDLY_NOT_NEEDED_IN_STORYBOOK = [
  "@astro/plugin-actions",
  "@astrojs/vite-plugin-astro-ssr-manifest",
  "astro-content-virtual-mod-plugin",
  "astro:actions",
  "astro:assets:esm",
  "astro:assets",
  "astro:build:normal",
  "astro:container",
  "astro:content-asset-propagation",
  "astro:content-imports",
  "astro:content-listen",
  "astro:dev-toolbar",
  "astro:head-metadata",
  "astro:html",
  "astro:i18n",
  "astro:integration-container",
  "astro:jsx",
  "astro:markdown",
  "astro:postprocess",
  "astro:prefetch",
  "astro:scanner",
  "astro:scripts:page-ssr",
  "astro:server",
  "astro:vite-plugin-env",
  "astro:vite-plugin-file-url",
];

export async function mergeWithAstroConfig(config: InlineConfig) {
  const { getViteConfig } = await import("astro/config");

  const astroConfig = await getViteConfig({})({
    mode: "development",
    command: "serve",
  });

  const filteredPlugins = astroConfig
    .plugins!.flat()
    .filter(
      (plugin) =>
        plugin &&
        "name" in plugin &&
        !ASTRO_PLUGINS_THAT_ARE_SUPPOSEDLY_NOT_NEEDED_IN_STORYBOOK.includes(
          plugin.name
        )
    );

  return mergeConfig(config, {
    ...astroConfig,
    plugins: filteredPlugins,
  });
}

export const vitePluginAstro = {
  name: "vite-plugin-astro-files",
  async transform(code: string, id: string) {
    if (id.endsWith(".astro")) {
      const result = await transform(code, {
        filename: id,
        sourcemap: "external",
        internalURL: "astro/runtime/server/index.js",
        resolvePath: async (specifier: string) =>
          path.resolve(path.dirname(id), specifier),
      });

      return {
        code: result.code,
        map: result.map,
      };
    }
  },
};
