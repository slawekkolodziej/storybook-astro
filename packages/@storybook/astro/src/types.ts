import type { CompatibleString, Options } from 'storybook/internal/types';
import type { InlineConfig } from 'vite';

type FrameworkName = CompatibleString<'@storybook/astro'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type $FIXME = any;

export type SupportedFramework =
  | 'react'
  | 'svelte'
  | 'vue'
  | 'solid'
  | 'preact';

export type FrameworkOptions = {
  integrations: SupportedFramework[];
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
