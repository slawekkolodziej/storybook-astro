import type { CompatibleString } from 'storybook/internal/types';
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

export type { StorybookConfigVite } from '@storybook/builder-vite';
