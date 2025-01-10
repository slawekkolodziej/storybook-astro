import { dirname, join } from 'node:path';
import * as reactPreset from '@storybook/react/preset';


// export function renderToCanvas(html: string) {
//   throw new Error('Not implemented');
// }

export const previewAnnotations = async (input = [], options) => {
  const docsConfig = await options.presets.apply('docs', {}, options);
  const features = await options.presets.apply('features', {}, options);
  const docsEnabled = Object.keys(docsConfig).length > 0;
  const result: string[] = [];

  return result
    .concat(input)
    .concat([join(__dirname, 'entry-preview.ts')])
    // .concat(docsEnabled ? [join(__dirname, 'entry-preview-docs.mjs')] : [])
    // .concat(features?.experimentalRSC ? [join(__dirname, 'entry-preview-rsc.mjs')] : []);
};


export const addons = reactPreset.addons;

export const resolvedReact = reactPreset.resolvedReact;
