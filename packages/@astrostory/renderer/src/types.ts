// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type $FIXME = any;

export type RenderComponentInput = {
  component: string;
  args: Record<string, unknown>;
  slots: Record<string, string>;
  story?: {
    id: string;
    title?: string;
    name?: string;
  };
};

export type RenderResponseMessage = {
  type: 'astro:render:response';
  data: {
    id: string;
    html: string;
  };
};

export type RenderRequestMessage = {
  type: 'astro:render:request';
  data: RenderComponentInput & {
    id: string;
  };
};

export type Message = RenderRequestMessage | RenderResponseMessage;

export type RenderPromise = {
  resolve: (value: RenderResponseMessage['data']) => void;
  reject: (reason?: unknown) => void;
  timeoutId: NodeJS.Timeout;
};
