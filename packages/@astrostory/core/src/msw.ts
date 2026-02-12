import type { RequestHandler } from 'msw';
import { setupServer } from 'msw/node';

type MswMode = 'development' | 'production';
type MswServer = ReturnType<typeof setupServer>;
type MswServerListenOptions = Parameters<MswServer['listen']>[0];
type MaybePromise<T> = T | Promise<T>;

export type MswConfig = {
  enabled?: boolean;
  handlers?: RequestHandler[];
  options?: MswServerListenOptions;
  listenOptions?: MswServerListenOptions;
};

export type MswConfigFactory = (context: {
  mode: MswMode;
}) => MaybePromise<MswConfig | RequestHandler[] | undefined>;

export type MswConfigModule = {
  default?: MswConfig | RequestHandler[] | MswConfigFactory;
  enabled?: boolean;
  handlers?: RequestHandler[];
  options?: MswServerListenOptions;
  listenOptions?: MswServerListenOptions;
};

type MswState = {
  server?: MswServer;
  lastConfigModule?: unknown;
  lastMode?: MswMode;
  pendingInitialization?: Promise<void>;
};

type MswGlobalState = typeof globalThis & {
  __astroStoryMswState__?: MswState;
};

export async function startMswServer(configModule: unknown, mode: MswMode): Promise<void> {
  const state = getMswState();

  if (state.lastConfigModule === configModule && state.lastMode === mode) {
    return;
  }

  if (state.pendingInitialization) {
    await state.pendingInitialization;

    if (state.lastConfigModule === configModule && state.lastMode === mode) {
      return;
    }
  }

  const initializationPromise = syncMswServer(configModule, mode, state);

  state.pendingInitialization = initializationPromise;

  try {
    await initializationPromise;
    state.lastConfigModule = configModule;
    state.lastMode = mode;
  } finally {
    state.pendingInitialization = undefined;
  }
}

async function syncMswServer(configModule: unknown, mode: MswMode, state: MswState): Promise<void> {
  const config = await resolveMswRuntimeConfig(configModule, mode);

  if (state.server) {
    state.server.close();
    state.server = undefined;
  }

  if (!config || config.enabled === false) {
    return;
  }

  const server = setupServer(...(config.handlers ?? []));

  server.listen(config.options ?? config.listenOptions);
  state.server = server;
}

async function resolveMswRuntimeConfig(
  configModule: unknown,
  mode: MswMode
): Promise<MswConfig | undefined> {
  const moduleExport = getMswModuleExport(configModule);
  const resolvedExport = await resolveMswModuleExportValue(moduleExport, mode);

  if (resolvedExport === undefined || resolvedExport === null) {
    return undefined;
  }

  if (Array.isArray(resolvedExport)) {
    return {
      handlers: resolvedExport
    };
  }

  if (!isRecord(resolvedExport)) {
    throw new Error(
      'MSW config must export a handler array, a config object, or a function returning one of them.'
    );
  }

  const normalizedConfig = normalizeMswConfigObject(resolvedExport);

  return normalizedConfig;
}

function getMswModuleExport(configModule: unknown): unknown {
  if (!isRecord(configModule)) {
    return configModule;
  }

  if ('default' in configModule && configModule.default !== undefined) {
    return configModule.default;
  }

  if (
    'handlers' in configModule ||
    'options' in configModule ||
    'listenOptions' in configModule ||
    'enabled' in configModule
  ) {
    return {
      handlers: configModule.handlers,
      options: configModule.options,
      listenOptions: configModule.listenOptions,
      enabled: configModule.enabled
    };
  }

  return undefined;
}

async function resolveMswModuleExportValue(moduleExport: unknown, mode: MswMode): Promise<unknown> {
  if (typeof moduleExport === 'function') {
    return (moduleExport as MswConfigFactory)({ mode });
  }

  return moduleExport;
}

function normalizeMswConfigObject(config: Record<string, unknown>): MswConfig {
  const handlers = config.handlers;

  if (handlers !== undefined && !Array.isArray(handlers)) {
    throw new Error('MSW config "handlers" must be an array.');
  }

  const enabled = config.enabled;

  if (enabled !== undefined && typeof enabled !== 'boolean') {
    throw new Error('MSW config "enabled" must be a boolean.');
  }

  const normalizedEnabled = typeof enabled === 'boolean' ? enabled : undefined;
  const normalizedHandlers = Array.isArray(handlers) ? (handlers as RequestHandler[]) : undefined;

  return {
    enabled: normalizedEnabled,
    handlers: normalizedHandlers,
    options: config.options as MswServerListenOptions | undefined,
    listenOptions: config.listenOptions as MswServerListenOptions | undefined
  };
}

function getMswState(): MswState {
  const globalState = globalThis as MswGlobalState;

  if (!globalState.__astroStoryMswState__) {
    globalState.__astroStoryMswState__ = {
      server: undefined,
      lastConfigModule: undefined,
      lastMode: undefined
    };
  }

  return globalState.__astroStoryMswState__;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return !Array.isArray(value);
}
