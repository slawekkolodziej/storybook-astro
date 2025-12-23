import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { $FIXME } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const previewAnnotations = async (input = [], _options: $FIXME) => {
  const result: string[] = [];

  return result
    .concat(input)
    .concat([join(__dirname, './entry-preview.ts')]);
};
