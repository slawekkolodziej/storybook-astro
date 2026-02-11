import type { Plugin } from 'vite';
import { createVirtualModulePlugin } from './createVirtualModulePlugin';

type ImportRecord = {
  id: string;
  file: string;
  importStatement: string;
};

export function astroFilesVirtualModulePlugin(astroComponents: string[]): Plugin {
  const pluginName = 'storybook-astro:virtual-astro-files';
  const virtualModuleId = 'virtual:astro-files';

  return createVirtualModulePlugin({
    pluginName,
    virtualModuleId,
    load() {
      const imports = astroComponents.reduce<ImportRecord[]>((acc, file, index) => {
        const moduleId = `_astroFile${index}`;
        const importStatement = `import ${moduleId} from '${file}';`;

        return [...acc, { id: moduleId, file, importStatement }];
      }, []);

      return [
        imports.map(({ importStatement }) => importStatement).join('\n'),
        'export default {',
        imports.map(({ file, id }) => `'${file}': ${id}`).join(',\n'),
        '};'
      ].join('\n');
    }
  });
}
