import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function handler(data) {
  const container = await AstroContainer.create();
  container.addServerRenderer({
    renderer: reactRenderer,
    name: "@astrojs/react",
  });

  container.addClientRenderer({
    name: "@astrojs/react",
    entrypoint: "@astrojs/react/client.js",
  });

  const { default: Component } = await import(
    data.component
    // "../../../src/components/Welcome.astro"
  );

  return container.renderToString(Component, {
    props: data.args,
  });
}
