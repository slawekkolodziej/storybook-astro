import { simulateDOMContentLoaded, simulatePageLoad } from 'storybook/internal/preview-api';
import type { ArgsStoryFn, RenderContext } from 'storybook/internal/types';
import { dedent } from 'ts-dedent';
import 'astro:scripts/page.js';
import type { $FIXME, RenderComponentInput, RenderPromise, RenderResponseMessage } from './types';
import * as renderers from 'virtual:storybook-renderer-fallback';

const messages = new Map<string, RenderPromise>();

export const render: ArgsStoryFn<$FIXME> = (args, context) => {
  const { id, component: Component } = context;

  const renderer = context.parameters?.renderer;

  if (renderer && Object.hasOwn(renderers, renderer)) {
    // Deep clone args to avoid issues with frozen objects in Preact/React/Solid
    const clonedContext = {
      ...context,
      args: structuredClone ? structuredClone(args) : JSON.parse(JSON.stringify(args))
    };
    return renderers[renderer].render(clonedContext.args, clonedContext);
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

    // Deep clone args to avoid issues with frozen objects in Preact/React
    const clonedArgs = JSON.parse(JSON.stringify(args));
    return <Component {...clonedArgs} />;
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
    const { html } = await renderAstroComponent({
      component: element.moduleId,
      args: args,
      slots: slots
    });

    applyStyles();
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

function applyStyles() {
  // FIXME: This can probably be simplified:
  Array.from(document.querySelectorAll('style[data-vite-dev-id]'))
    // FIXME: Clean this up
    .filter((el) => /__vite__updateStyle/.test(el.innerHTML))
    .map((el) => {
      const newScript = document.createElement('script');

      newScript.type = 'module';
      const scriptText = document.createTextNode(
        el.innerHTML
          .replaceAll('import.meta.hot.accept(', 'import.meta.hot?.accept(')
          .replaceAll('import.meta.hot.prune(', 'import.meta.hot?.prune(')
      );

      newScript.appendChild(scriptText);
      document.head.appendChild(newScript);
      document.head.removeChild(newScript);
    });
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

async function renderAstroComponent(data: RenderComponentInput, timeoutMs = 5000) {
  const id = crypto.randomUUID();

  const promise = new Promise<RenderResponseMessage['data']>((resolve, reject) => {
    // Abort rendering if it did not finish on time
    const timeoutId = setTimeout(() => {
      messages.delete(id);
      reject(new Error(`Request ${id} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    messages.set(id, { resolve, reject, timeoutId });
  });

  import.meta.hot?.send('astro:render:request', { ...data, id });

  return promise;
}

(function init() {
  if ('Alpine' in window) {
    const alpine = window.Alpine as $FIXME;
    // Only start Alpine if it hasn't been started yet
    if (!alpine._isStarted) {
      alpine.start();
    }
  }

  // Subscribe to Vite hot updates - we use it to re-apply Astro styles
  import.meta.hot?.on('vite:afterUpdate', (payload) => {
    if (
      payload.updates.some((update) => {
        // FIXME: parse this path better
        return update.path.endsWith('.astro?astro&type=style&index=0&lang.css');
      })
    ) {
      applyStyles();
    }
  });

  // Subscribe to Astro render response messages
  import.meta.hot?.on('astro:render:response', (data: RenderResponseMessage['data']) => {
    // Check if this is a response to a pending request
    if (data.id && messages.has(data.id)) {
      const { resolve, timeoutId } = messages.get(data.id)!;

      // Clear timeout and resolve promise
      clearTimeout(timeoutId);
      messages.delete(data.id);
      resolve(data);
    }
  });
})();
