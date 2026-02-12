import type { RequestHandler } from 'msw';
import { setupServer } from 'msw/node';

type MswServer = ReturnType<typeof setupServer>;
type MswServerListenOptions = Parameters<MswServer['listen']>[0];

type MswState = {
  server?: MswServer;
  pendingUpdate?: Promise<void>;
};

type MswGlobalState = typeof globalThis & {
  __astroStoryMswState__?: MswState;
};

const defaultListenOptions: MswServerListenOptions = {
  onUnhandledRequest: 'bypass'
};

export async function applyMswHandlers(handlers: RequestHandler[]): Promise<void> {
  const state = getMswState();

  if (state.pendingUpdate) {
    await state.pendingUpdate;
  }

  const updatePromise = syncMswHandlers(handlers, state);

  state.pendingUpdate = updatePromise;

  try {
    await updatePromise;
  } finally {
    state.pendingUpdate = undefined;
  }
}

async function syncMswHandlers(handlers: RequestHandler[], state: MswState): Promise<void> {
  if (!state.server) {
    state.server = setupServer();
    state.server.listen(defaultListenOptions);
  }

  state.server.resetHandlers(...handlers);
}

function getMswState(): MswState {
  const globalState = globalThis as MswGlobalState;

  if (!globalState.__astroStoryMswState__) {
    globalState.__astroStoryMswState__ = {
      server: undefined,
      pendingUpdate: undefined
    };
  }

  return globalState.__astroStoryMswState__;
}
