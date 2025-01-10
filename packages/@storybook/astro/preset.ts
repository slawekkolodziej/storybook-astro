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

      server.middlewares.use("/__render_astro_story", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        let body = "";
        req.on("readable", () => {
          body += req.read();
        });
        req.on("end", async () => {
          const data = JSON.parse(body);
          res.setHeader("Content-Type", "text/html");
          const result = await mod.handler(data);
          res.end(result);
        });
      });
    },
  });

  return finalConfig;
};
