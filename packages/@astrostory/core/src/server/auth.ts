import type { Context, MiddlewareHandler } from 'hono';

export type AuthMode = 'external' | 'simple-token';

type AuthEnv = {
  AUTH_MODE?: string;
  AUTH_TOKEN?: string;
  AUTH_TOKEN_ID?: string;
  AUTH_TOKEN_EXPIRES_AT?: string;
};

type SimpleTokenConfig = {
  mode: 'simple-token';
  token: string;
  tokenId?: string;
  tokenExpiresAt?: string;
};

type ExternalConfig = {
  mode: 'external';
};

export type AuthConfig = ExternalConfig | SimpleTokenConfig;

export function resolveAuthConfig(env: AuthEnv = process.env): AuthConfig {
  const mode = (env.AUTH_MODE ?? 'external') as AuthMode;

  if (mode === 'external') {
    return { mode };
  }

  if (mode === 'simple-token') {
    const token = env.AUTH_TOKEN?.trim();

    if (!token) {
      throw new Error('AUTH_TOKEN is required when AUTH_MODE is simple-token.');
    }

    return {
      mode,
      token,
      tokenId: env.AUTH_TOKEN_ID,
      tokenExpiresAt: env.AUTH_TOKEN_EXPIRES_AT
    };
  }

  throw new Error(`Unsupported AUTH_MODE "${mode}". Expected external or simple-token.`);
}

export function createAuthMiddleware(config: AuthConfig): MiddlewareHandler {
  return async function authMiddleware(c, next) {
    if (config.mode === 'external') {
      c.set('auth', { mode: 'external', authenticated: true });
      await next();

      return;
    }

    if (config.mode === 'simple-token') {
      const providedToken = parseBearerToken(c.req.header('authorization'));

      if (providedToken !== config.token) {
        return unauthorized(c);
      }

      c.set('auth', {
        mode: 'simple-token',
        authenticated: true,
        tokenId: config.tokenId,
        tokenExpiresAt: config.tokenExpiresAt
      });
      await next();

      return;
    }

    return unauthorized(c);
  };
}

function parseBearerToken(authorizationHeader: string | undefined): string | undefined {
  if (!authorizationHeader) {
    return undefined;
  }

  const matches = authorizationHeader.match(/^Bearer\s+(.+)$/i);

  if (!matches) {
    return undefined;
  }

  return matches[1]?.trim();
}

function unauthorized(c: Context) {
  return c.json({ error: 'Unauthorized' }, 401);
}
