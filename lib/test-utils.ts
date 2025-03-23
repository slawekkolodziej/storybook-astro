import type { Plugin } from "vite";
import type { AstroIntegration } from "astro";

export function solidVitestPatch(): AstroIntegration {
  return {
    name: 'fix-solid',
    hooks: {
      'astro:config:done': ({ config }) => {
        const solidPlugin = config.vite.plugins?.find(
          (plugin) => plugin && 'name' in plugin && plugin.name === 'solid'
        ) as Plugin | undefined;

        if (solidPlugin) {
          const originalConfigEnvironment = solidPlugin.configEnvironment;

          if (typeof originalConfigEnvironment === 'function') {
            solidPlugin.configEnvironment = async (name, config, opts) => {
              await originalConfigEnvironment(name, config, opts);

              config.resolve ??= {};
              config.resolve.conditions = config.resolve?.conditions?.filter(
                (condition) => condition !== 'browser'
              );
            };
          }
        }
      }
    }
  };
}
