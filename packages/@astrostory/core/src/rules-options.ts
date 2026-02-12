import { existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';

export type RulesOptions =
  | string
  | {
      configFile: string;
    };

export function resolveRulesConfigFilePath(options?: RulesOptions): string | undefined {
  if (options === undefined) {
    return undefined;
  }

  const configFile = normalizeConfigFileOption(options);
  const resolvedConfigFilePath = resolve(process.cwd(), configFile);
  const normalizedConfigFilePath = resolveConfigFilePath(resolvedConfigFilePath);

  if (!normalizedConfigFilePath) {
    throw new Error(
      `framework.options.rules config file was not found: ${resolvedConfigFilePath}. ` +
        'Provide an existing path in framework.options.rules.'
    );
  }

  return normalizedConfigFilePath;
}

function normalizeConfigFileOption(options: RulesOptions): string {
  const configFile =
    typeof options === 'string'
      ? options
      : typeof options === 'object' && options !== null
        ? options.configFile
        : undefined;

  if (typeof configFile !== 'string') {
    throw new Error(
      'framework.options.rules must be either a string path or an object with a string configFile.'
    );
  }

  const normalizedConfigFile = configFile.trim();

  if (!normalizedConfigFile) {
    throw new Error('framework.options.rules config file path cannot be empty.');
  }

  return normalizedConfigFile;
}

function resolveConfigFilePath(filePath: string): string | undefined {
  if (existsSync(filePath)) {
    return filePath;
  }

  if (extname(filePath)) {
    return undefined;
  }

  const extensions = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'];

  for (const extension of extensions) {
    const candidateFilePath = `${filePath}${extension}`;

    if (existsSync(candidateFilePath)) {
      return candidateFilePath;
    }
  }

  for (const extension of extensions) {
    const candidateFilePath = resolve(filePath, `index${extension}`);

    if (existsSync(candidateFilePath)) {
      return candidateFilePath;
    }
  }

  return undefined;
}
