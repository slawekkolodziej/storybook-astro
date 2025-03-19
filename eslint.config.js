import eslintPluginJest from 'eslint-plugin-jest';
import eslintPluginNode from 'eslint-plugin-n';
import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginWorkspaces from 'eslint-plugin-workspaces';
import svelte from 'eslint-plugin-svelte';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

const ALL_EXTENSIONS = 'js,ts,jsx,tsx,cjs,mjs,mts,astro,svelte,vue';
const NODE_JS_FILES = [
  `./packages/@storybook/astro/**/*.{${ALL_EXTENSIONS}}`,
  `./.storybook/**/*.{${ALL_EXTENSIONS}}`,
  'eslint.config.mjs',
  'prettier.config.mjs'
];
const JSX_EXTENSIONS = 'js,ts,jsx,tsx,cjs,mjs,mts';
const JSX_FILES = [
  `./packages/@storybook/astro-renderer/**/*.{${JSX_EXTENSIONS}}`,
  `./src/**/*.{${JSX_EXTENSIONS}}`,
];

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPromise.configs['flat/recommended'],

  // Node JS specific config
  {
    files: NODE_JS_FILES,

    ...eslintPluginNode.configs['flat/recommended-script'],

    rules: {
      ...eslintPluginNode.configs['flat/recommended-script'].rules,
      'n/no-unpublished-import': ['off']
    }
  },

  // JSX specific config
  {
    files: JSX_FILES,
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },

  // Svelte overrides
  {
    files: [
      './src/**/*.svelte',
      './src/**/*.svelte.js',
      './packages/**/*.svelte',
      './packages/**/*.svelte.js'
    ],

    languageOptions: {
      parserOptions: {
        svelteConfig
      }
    },

    ...svelte.configs.recommended,
  },

  // Custom global overrides
  {
    files: ['**/*.{js,ts,jsx,tsx,cjs,mjs,mts}'],

    plugins: {
      workspaces: eslintPluginWorkspaces
    },

    rules: {
      'newline-after-var': ['error', 'always'],
      'newline-before-return': ['error'],
      curly: ['warn', 'all'],
      camelcase: ['error'],
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Type import/exports
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports'
        }
      ],

      // Use TS semi
      semi: ['error', 'always'],

      // Use TS no-unused-vars
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],

      // Use TS no-redeclare
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',

      // Disable unnecessary typescript rules
      '@typescript-eslint/triple-slash-reference': ['off'],

      // Type import/exports
      '@typescript-eslint/no-import-type-side-effects': ['error'],

      '@typescript-eslint/no-empty-object-type': ['error', {
        allowInterfaces: 'always'
      }],

      'workspaces/no-relative-imports': 'error',
      'workspaces/no-absolute-imports': 'error',
      'workspaces/require-dependency': 'error'
    }
  },

  // Tests specific config
  {
    files: [`**/__tests__/**/*.{spec,test}.{${ALL_EXTENSIONS}}`],

    plugins: {
      jest: eslintPluginJest
    }
  },

  // Global ignores
  {
    ignores: [
      '.yarn/',
      '.astro',
      '**/coverage/',
      '**/@types/',
      '.vscode/',
      '.idea/'
    ]
  }
];
