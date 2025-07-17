import type { RenderComponentInput, RenderResponseMessage } from '../types';

// Production renderer - uses HTTP to communicate with standalone Hono server
export async function render(data: RenderComponentInput, timeoutMs = 5000) {
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const id = crypto.randomUUID();

  // Get server URL from environment or use default
  const serverUrl = process.env.STORYBOOK_ASTRO_SERVER_URL || 'http://localhost:3000';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${serverUrl}/render`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    return {
      id,
      html
    } satisfies RenderResponseMessage['data'];
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }

    throw error;
  }
}

export function init() {
  console.log('Set up astro prod rederer');
}
