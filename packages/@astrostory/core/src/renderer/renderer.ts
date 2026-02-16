import type { RenderComponentInput, RenderResponseMessage } from '../types.ts';

type StorybookImportMetaEnv = ImportMeta & {
  env?: Record<string, string | undefined>;
};

type StorybookGlobalEnv = typeof globalThis & {
  STORYBOOK_ASTRO_SERVER_URL?: string;
  STORYBOOK_ASTRO_AUTH_TOKEN?: string;
};

const ASTRO_SERVER_UNAVAILABLE_ERROR_NAME = 'AstroRenderServerUnavailableError';

// Production renderer - uses HTTP to communicate with standalone Hono server
export async function render(data: RenderComponentInput, timeoutMs = 5000) {
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const id = crypto.randomUUID();

  const serverUrl = getServerUrl();

  const authToken = getAuthToken();

  const requestHeaders: Record<string, string> = {
    'content-type': 'application/json'
  };

  if (authToken) {
    requestHeaders.authorization = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${serverUrl}/render`, {
      method: 'POST',
      headers: requestHeaders,
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

    if (error instanceof Error && error.name === 'AbortError') {
      throw createServerUnavailableError(
        serverUrl,
        `Request timed out after ${timeoutMs}ms while waiting for a render response.`
      );
    }

    if (error instanceof TypeError) {
      throw createServerUnavailableError(
        serverUrl,
        'The Astro rendering server is not reachable over HTTP.'
      );
    }

    throw error;
  }
}

function getServerUrl() {
  const envServerUrl = (import.meta as StorybookImportMetaEnv).env?.STORYBOOK_ASTRO_SERVER_URL;
  const globalServerUrl = (globalThis as StorybookGlobalEnv).STORYBOOK_ASTRO_SERVER_URL;

  return envServerUrl || globalServerUrl || 'http://localhost:3000';
}

function getAuthToken() {
  const envAuthToken = (import.meta as StorybookImportMetaEnv).env?.STORYBOOK_ASTRO_AUTH_TOKEN;
  const globalAuthToken = (globalThis as StorybookGlobalEnv).STORYBOOK_ASTRO_AUTH_TOKEN;

  return envAuthToken || globalAuthToken;
}

export function init() {
  return;
}

export function applyStyles() {
  return;
}

function createServerUnavailableError(serverUrl: string, reason: string) {
  const error = new Error(`Unable to reach Astro rendering server at ${serverUrl}. ${reason}`);

  error.name = ASTRO_SERVER_UNAVAILABLE_ERROR_NAME;

  return error;
}
