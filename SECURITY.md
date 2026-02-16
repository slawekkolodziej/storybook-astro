# Security Notes

This project includes optional server-side HTML sanitization for story args and slots.

Configure it in `.storybook/main.js` under `framework.options.sanitization`:

```js
framework: {
  name: '@astrostory/core',
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

## Behavior

- Path patterns support `*` for one segment and `**` for any depth.
- If `sanitization` is enabled and `slots` is omitted, all slot names are sanitized (`['**']`).
- Function-valued `sanitize-html` options are intentionally not supported in framework options.

## Default policy

The default policy is moderate. It allows common content/layout tags such as:

- `div`, `span`, `img`, `b`, `i`, `hr`
- headings, lists, and tables
- safe attributes such as global `class` and image `src` / `alt`

Unsafe constructs like scripts and inline event handler attributes are blocked.
