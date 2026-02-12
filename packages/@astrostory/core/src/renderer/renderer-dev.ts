import type { RenderComponentInput, RenderPromise, RenderResponseMessage } from '../types.ts';

const messages = new Map<string, RenderPromise>();
const ASTRO_SERVER_UNAVAILABLE_ERROR_NAME = 'AstroRenderServerUnavailableError';

export async function render(data: RenderComponentInput, timeoutMs = 5000) {
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const id = crypto.randomUUID();

  const promise = new Promise<RenderResponseMessage['data']>((resolve, reject) => {
    // Abort rendering if it did not finish on time
    const timeoutId = setTimeout(() => {
      messages.delete(id);
      const error = new Error(
        `Unable to reach Astro rendering server. No render response was received within ${timeoutMs}ms.`
      );

      error.name = ASTRO_SERVER_UNAVAILABLE_ERROR_NAME;

      reject(error);
    }, timeoutMs);

    messages.set(id, { resolve, reject, timeoutId });
  });

  import.meta.hot?.send('astro:render:request', { ...data, id });

  return promise;
}

export function init() {
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
}

export function applyStyles() {
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
