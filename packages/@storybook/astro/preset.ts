import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@astrojs/react";
import type {
  StorybookConfigVite,
  FrameworkOptions,
  SupportedFramework,
} from "./types";
import type { AstroInlineConfig } from "astro/config";

export async function createViteServer(integrations: SupportedFramework[]) {
  const { getViteConfig } = await import("astro/config");
  const finalConfig = await getViteConfig(
    {},
    {
      integrations: await loadIntegrations(integrations),
    }
  )({ mode: "development", command: "serve" });

  const viteServer = await createServer({
    configFile: false,
    ...finalConfig,
    plugins: finalConfig.plugins?.filter(Boolean),
  });

  return viteServer;
}

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
  const { getViteConfig } = await import("astro/config");
  const options = await presets.apply<FrameworkOptions>("frameworkOptions");
  const viteServer = await createViteServer(options.integrations);
  const finalConfig = await getViteConfig(config)({
    mode: "development",
    command: "serve",
  });

  finalConfig.plugins!.push({
    name: "storybook-astro-renderer",
    async configureServer(server) {
      const filePath = fileURLToPath(new URL("./middleware", import.meta.url));
      const mod = await viteServer.ssrLoadModule(filePath, {
        fixStacktrace: true,
      });
      const handler = await mod.handlerFactory(options.integrations);

      server.ws.on("astro:render:request", async (data) => {
        const html = await handler(data, options.integrations);

        server.ws.send("astro:render:response", { html });
      });
    },
  });

  return finalConfig;
};

async function loadIntegrations(
  integrations: SupportedFramework[]
): Promise<AstroInlineConfig["integrations"]> {
  const frameworkMap = {
    react: "@astrojs/react",
    svelte: "@astrojs/svelte",
    vue: "@astrojs/vue",
    solid: "@astrojs/solid-js",
  };

  return Promise.all(
    integrations
      .map(async (integration) => {
        if (!frameworkMap[integration]) {
          console.error(`Unsupported framework: ${integration}`);
          return null;
        }

        const framework = await import(frameworkMap[integration]);

        if (integration === "solid") {
          return framework.default({
            include: ["**/solid/*"],
          });
        }

        return framework.default();
      })
      .filter(Boolean)
  );
}
