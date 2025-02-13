import { isValidElement } from "react";
import { renderToCanvas as renderToCanvasReact } from "@storybook/react/dist/entry-preview.mjs";
import {
  simulateDOMContentLoaded,
  simulatePageLoad,
} from "storybook/internal/preview-api";
import type { ArgsStoryFn, RenderContext } from "storybook/internal/types";
import { global } from "@storybook/global";
import { dedent } from "ts-dedent";

const { Node } = global;

export const render: ArgsStoryFn<any> = (args, context) => {
  const { id, component: Component } = context;

  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  if (typeof Component === "string") {
    let output = Component;
    Object.keys(args).forEach((key) => {
      output = output.replace(`{{${key}}}`, args[key]);
    });
    return output;
  }

  if (Component instanceof HTMLElement) {
    const output = Component.cloneNode(true) as HTMLElement;
    Object.keys(args).forEach((key) => {
      output.setAttribute(
        key,
        typeof args[key] === "string" ? args[key] : JSON.stringify(args[key])
      );
    });

    return output;
  }

  if (typeof Component === "function") {
    if (Component.isAstroComponentFactory) {
      return Component;
    }

    return <Component {...args} />;
  }

  console.warn(dedent`
    Storybook's HTML renderer only supports rendering DOM elements and strings.
    Received: ${Component}
  `);
  throw new Error(`Unable to render story ${id}`);
};

export async function renderToCanvas(
  ctx: RenderContext<any>,
  canvasElement: any
) {
  const {
    storyFn,
    kind,
    name,
    showMain,
    showError,
    forceRemount,
    storyContext,
  } = ctx;
  const element = storyFn();

  showMain();

  if (element.isAstroComponentFactory) {
    const { slots = {}, ...args } = storyContext.args;
  
    const renderAstro = (data) => {
      canvasElement.innerHTML = data.html;
      import.meta.hot?.off('astro:render:response', renderAstro);

      Array.from<HTMLScriptElement>(
        canvasElement.querySelectorAll("script")
      ).forEach((oldScript) => {
        const newScript = document.createElement("script");
  
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
  
        const scriptText = document.createTextNode(oldScript.innerHTML);
  
        newScript.appendChild(scriptText);
  
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
    import.meta.hot?.on('astro:render:response', renderAstro);
    import.meta.hot?.send('astro:render:request', {
      component: element.moduleId,
      args: args,
      slots: slots,
    });
  } else if (typeof element === "string") {
    canvasElement.innerHTML = element;
    simulatePageLoad(canvasElement);
  } else if (element instanceof Node) {
    if (canvasElement.firstChild === element && forceRemount === false) {
      return;
    }

    canvasElement.innerHTML = "";
    canvasElement.appendChild(element);
    simulateDOMContentLoaded();
  } else if (isValidElement(element)) {
    return renderToCanvasReact(ctx, canvasElement);
  } else {
    showError({
      title: `Expecting an HTML snippet or DOM node from the story: "${name}" of "${kind}".`,
      description: dedent`
        Did you forget to return the HTML snippet from the story?
        Use "() => <your snippet or node>" or when defining the story.
      `,
    });
  }
}
