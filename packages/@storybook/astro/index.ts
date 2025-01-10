// import { fileURLToPath } from "node:url";
// import { getViteConfig } from "astro/config";
// import react from "@astrojs/react";
// import { createServer } from "vite";

// export async function createViteServer() {
//   const { plugins, ...finalConfig } = await getViteConfig(
//     {},
//     {
//       integrations: [react()],
//     }
//   )({ mode: "development", command: "serve" });

//   const viteServer = await createServer({
//     configFile: false,
//     ...finalConfig,
//     plugins: plugins?.filter(Boolean),
//   });

//   return viteServer;
// }

// const viteServer = await createViteServer();
// const filePath = fileURLToPath(new URL("./middleware", import.meta.url));

// const mod = await viteServer.ssrLoadModule(filePath, { fixStacktrace: true });

// console.log(await mod.handler());
