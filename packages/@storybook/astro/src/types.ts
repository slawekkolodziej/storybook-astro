import type { CompatibleString, Options } from 'storybook/internal/types';
import type { InlineConfig } from 'vite';
import type { Integration } from './integrations.ts';

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
