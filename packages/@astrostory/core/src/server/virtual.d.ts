declare module 'virtual:astro-files' {}

declare module 'virtual:storybook-astro-story-rules-config' {
  const storyRulesConfigModule: unknown;
  const storybookAstroStoryRulesConfigFilePath: string | undefined;

  export default storyRulesConfigModule;
  export { storybookAstroStoryRulesConfigFilePath };
}
