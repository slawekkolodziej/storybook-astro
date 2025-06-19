import type { CompatibleString, Options } from 'storybook/internal/types';
import type { InlineConfig } from 'vite';
import type { Integration } from './integrations';

type FrameworkName = CompatibleString<'@storybook/astro'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type $FIXME = any;

export type { Integration };
export type FrameworkOptions = {
  integrations: Integration[];
};

type StorybookConfigFramework = {
  framework: {
    name: FrameworkName;
    options: FrameworkOptions;
  };
};

export type StorybookConfig = StorybookConfigFramework;

type ViteFinal = (config: InlineConfig, options: Options) => InlineConfig | Promise<InlineConfig>;

export type StorybookConfigVite = {
    viteFinal?: ViteFinal;
};

export type RenderComponentInput = {
  component: string;
  args: Record<string, unknown>;
  slots: Record<string, string>;
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
