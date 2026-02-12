# Astro Storybook

The goal of this project is to enable support for Astro components in Storybook.

This repository is an experimental project and is not a fully functional Storybook addon. It is not ready for production use.

It uses Vitest To verify that Astro Container API works as expected. You can try it out by running `yarn test`.

## Setup instructions

1. Clone the repo
2. Run `yarn install`
3. Run `yarn storybook`

## Code structure

The repository is based on Astro blank project.

Code responsible for Storybook integration lives in two packages:
<<<<<<< Updated upstream

- `packages/@storybook/astro` - defines Storybook framework (https://storybook.js.org/docs/configure/integration/frameworks), it is responsible for server-side rendering Astro components
- `packages/@storybook/astro-renderer` - a package that gets imported into client-side of Storybook, it sends render requests to Astro rendering proxy.

## HTML sanitization

`@storybook/astro` supports server-side HTML sanitization for incoming story args/slots.

Configure it in `.storybook/main.js` under `framework.options.sanitization`:

```js
framework: {
  name: '@storybook/astro',
  options: {
    integrations: [/* ... */],
    sanitization: {
      args: ['contentHtml', 'items.*.bodyHtml'],
      slots: ['**'],
      sanitizeHtml: {
        allowedTags: ['p', 'a', 'strong', 'em', 'ul', 'ol', 'li', 'br'],
        allowedAttributes: {
          a: ['href', 'target', 'rel']
        }
      }
    }
  }
}
```

Path patterns support `*` for one segment and `**` for any depth. Function-valued `sanitize-html`
options are intentionally unsupported in framework options.

If `sanitization` is enabled and `slots` is omitted, all slot names are sanitized by default (`['**']`).

The default policy is intentionally moderate (not tiny): it allows common content/layout tags such as
`div`, `span`, `img`, `b`, `i`, `hr`, headings, lists, tables, plus safe attributes including `class`
globally and `src`/`alt` for images. Scripts, event handler attributes, and other unsafe constructs are
still blocked.
=======

- `packages/@astrostory/core` - defines Storybook framework (https://storybook.js.org/docs/configure/integration/frameworks), it is responsible for server-side rendering Astro components
- `packages/@astrostory/renderer` - a package that gets imported into client-side of Storybook, it sends render requests to Astro rendering proxy.
>>>>>>> Stashed changes

**Any help is highly appreciated!**
