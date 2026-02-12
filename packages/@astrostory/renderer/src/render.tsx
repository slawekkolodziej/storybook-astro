import { simulateDOMContentLoaded, simulatePageLoad } from 'storybook/internal/preview-api';
import type { ArgsStoryFn, RenderContext } from 'storybook/internal/types';
import { dedent } from 'ts-dedent';
import 'astro:scripts/page.js';
import type { $FIXME } from './types.ts';
import * as renderers from 'virtual:storybook-renderer-fallback';
import * as astroRenderer from 'virtual:storybook-astro-renderer';

export const render: ArgsStoryFn<$FIXME> = (args, context) => {
  const { id, component: Component } = context;

  const renderer = context.parameters?.renderer;

  if (renderer && Object.hasOwn(renderers, renderer)) {
    return renderers[renderer].render(args, context);
  }

  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  if (typeof Component === 'string') {
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
        typeof args[key] === 'string' ? args[key] : JSON.stringify(args[key])
      );
    });

    return output;
  }

  if (typeof Component === 'function') {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: RenderContext<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canvasElement: any
) {
  const { storyFn, kind, name, showMain, showError, forceRemount, storyContext } = ctx;
  const element = storyFn();

  showMain();

  const renderer = ctx.storyContext.parameters?.renderer;

  if (element?.isAstroComponentFactory) {
    const { slots = {}, ...args } = storyContext.args;
    let html: string;

    try {
      const response = await astroRenderer.render({
        component: element.moduleId,
        args: args,
        slots: slots,
        story: {
          id: storyContext.id,
          title: kind,
          name
        }
      });

      html = response.html;
    } catch (error) {
      if (isAstroServerUnavailableError(error)) {
        showError({
          title: 'Unable to reach Astro rendering server.',
          description: dedent`
            Storybook could not connect to the Astro rendering server, so this Astro story cannot be rendered.
            ${error.message}
          `
        });

        return;
      }

      throw error;
    }

    astroRenderer.applyStyles?.();
    canvasElement.innerHTML = html;
    invokeScriptTags(canvasElement);
  } else if (typeof element === 'string') {
    canvasElement.innerHTML = element;
    simulatePageLoad(canvasElement);
  } else if (Object.hasOwn(renderers, renderer)) {
    return renderers[renderer].renderToCanvas(ctx, canvasElement);
  } else if (element instanceof window.Node) {
    if (canvasElement.firstChild === element && forceRemount === false) {
      return;
    }

    canvasElement.innerHTML = '';
    canvasElement.appendChild(element);
    simulateDOMContentLoaded();
  } else {
    showError({
      title: `Expecting an HTML snippet or DOM node from the story: "${name}" of "${kind}".`,
      description: dedent`
        Did you forget to return the HTML snippet from the story?
        Use "() => <your snippet or node>" or when defining the story.
      `
    });
  }
}

function invokeScriptTags(element: HTMLElement) {
  Array.from<HTMLScriptElement>(element.querySelectorAll('script')).forEach((oldScript) => {
    const newScript = document.createElement('script');

    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });

    const scriptText = document.createTextNode(oldScript.innerHTML);

    newScript.appendChild(scriptText);

    oldScript.parentNode?.replaceChild(newScript, oldScript);
  });
}

function isAstroServerUnavailableError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === 'AstroRenderServerUnavailableError' ||
    error.message.includes('Unable to reach Astro rendering server')
  );
}

(function init() {
  if ('Alpine' in window) {
    (window.Alpine as $FIXME).start();
  }

  // Subscribe to Astro render response messages
  astroRenderer.init();
})();
