import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function handler(data) {
  const container = await AstroContainer.create({
    // Somewhat hacky way to force client-side Storybook's Vite to resolve modules properly
    resolve: async (s) => {
      if (
        s.startsWith("astro:scripts") ||
        s.startsWith("@astrojs/react/client")
      ) {
        return `/@id/${s}`;
      }

      return s;
    },
  });
  container.addServerRenderer({
    renderer: reactRenderer,
    name: "@astrojs/react",
  });

  container.addClientRenderer({
    name: "@astrojs/react",
    entrypoint: "@astrojs/react/client.js",
  });

  const { default: Component } = await import(
    /* @vite-ignore */ data.component
  );

  return container.renderToString(Component, {
    props: data.args,
  });
}
