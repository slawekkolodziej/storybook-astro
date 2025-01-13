import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { expect, test } from "vitest";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import Welcome from "./Welcome.astro";

async function renderAstroComponent(
  Component: AstroComponentFactory,
  renderingOptions = {}
) {
  const container = await AstroContainer.create();
  container.addServerRenderer({
    name: "@astrojs/react",
    renderer: reactRenderer,
  });
  container.addClientRenderer({
    name: "@astrojs/react",
    entrypoint: "@astrojs/react/client.js",
  });

  return container.renderToString(Component, renderingOptions);
}

test("Card with slots", async () => {
  const result = await renderAstroComponent(Welcome);

  expect(result).toContain("Hello World!");
  expect(result).toContain("This is astro component!");
  expect(result).toContain("Welcome from React!");
});

test("Card with custom title", async () => {
  const result = await renderAstroComponent(Welcome, {
    props: {
      title: "Custom title",
    },
  });

  expect(result).toContain("Custom title");
  expect(result).toContain("This is astro component!");
  expect(result).toContain("Welcome from React!");
});
