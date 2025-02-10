import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import { createServer } from "vite";

export async function createViteServer() {
  const { getViteConfig } = await import("astro/config");
  const finalConfig = await getViteConfig(
    {},
    {
      integrations: [react()],
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

export const viteFinal = async (config, { presets }) => {
  const { getViteConfig } = await import("astro/config");

  const viteServer = await createViteServer();
  const finalConfig = await getViteConfig(config, {
    integrations: [react()],
  })({ mode: "development", command: "serve" });

  finalConfig.plugins.push({
    name: "storybook-astro-renderer",
    async configureServer(server) {
      const filePath = fileURLToPath(new URL("./middleware", import.meta.url));
      const mod = await viteServer.ssrLoadModule(filePath, {
        fixStacktrace: true,
      });

      server.ws.on("astro:render:request", async (data) => {
        const html = await mod.handler(data);

        server.ws.send("astro:render:response", { html });
      });
    },
  });

  return finalConfig;
};
