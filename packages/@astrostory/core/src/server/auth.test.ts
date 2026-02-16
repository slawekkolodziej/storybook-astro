import { Hono } from 'hono';
import { describe, expect, test } from 'vitest';
import { createAuthMiddleware, resolveAuthConfig } from './auth.ts';

describe('auth config', () => {
  test('defaults to external mode', () => {
    const config = resolveAuthConfig({});

    expect(config).toEqual({ mode: 'external' });
  });

  test('requires AUTH_TOKEN in simple-token mode', () => {
    expect(() => resolveAuthConfig({ AUTH_MODE: 'simple-token' })).toThrow(
      'AUTH_TOKEN is required when AUTH_MODE is simple-token.'
    );
  });

  test('rejects unsupported auth modes', () => {
    expect(() => resolveAuthConfig({ AUTH_MODE: 'invalid' })).toThrow(
      'Unsupported AUTH_MODE "invalid". Expected external or simple-token.'
    );
  });
});

describe('auth middleware', () => {
  test('enforces bearer token in simple-token mode', async () => {
    const app = new Hono();
    const config = resolveAuthConfig({ AUTH_MODE: 'simple-token', AUTH_TOKEN: 'secret-value' });

    app.use('*', createAuthMiddleware(config));
    app.post('/render', (c) => c.text('ok'));

    const unauthorized = await app.request('http://localhost/render', {
      method: 'POST'
    });

    expect(unauthorized.status).toBe(401);

    const authorized = await app.request('http://localhost/render', {
      method: 'POST',
      headers: {
        authorization: 'Bearer secret-value'
      }
    });

    expect(authorized.status).toBe(200);
    await expect(authorized.text()).resolves.toBe('ok');
  });
});
