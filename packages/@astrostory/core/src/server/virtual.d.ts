declare module 'virtual:astro-files' {}

declare module 'virtual:storybook-astro-rules-config' {
  const rulesConfigModule: unknown;
  const storybookAstroRulesConfigFilePath: string | undefined;

  export default rulesConfigModule;
  export { storybookAstroRulesConfigFilePath };
}
