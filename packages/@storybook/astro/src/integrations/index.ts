import { AlpineIntegration, type Options as AlpineOptions } from './alpine';
import { PreactIntegration, type Options as PreactOptions } from './preact';
import { ReactIntegration, type Options as ReactOptions } from './react';
import { SolidIntegration, type Options as SolidOptions } from './solid';
import { SvelteIntegration, type Options as SvelteOptions } from './svelte';
import { VueIntegration, type Options as VueOptions } from './vue';


export function alpinejs(options?: AlpineOptions) {
  return new AlpineIntegration(options);
}
export const alpine = alpinejs;

export function preact(options?: PreactOptions) {
  return new PreactIntegration(options);
}

export function react(options?: ReactOptions) {
  return new ReactIntegration(options);
}

export function solid(options?: SolidOptions) {
  return new SolidIntegration(options);
}

export function svelte(options?: SvelteOptions) {
  return new SvelteIntegration(options);
}

export function vue(options?: VueOptions) {
  return new VueIntegration(options);
}

export type { Integration } from './base';