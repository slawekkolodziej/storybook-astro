import type { RenderComponentInput, RenderPromise, RenderResponseMessage } from '../types';

const messages = new Map<string, RenderPromise>();

export async function render(data: RenderComponentInput, timeoutMs = 5000) {
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const id = crypto.randomUUID();

  const promise = new Promise<RenderResponseMessage['data']>((resolve, reject) => {
    resolve({
      id,
      html: 'To be implemented...'
    });
  });

  return promise;
}

export function init() {
  console.log('Set up astro prod rederer');
}
