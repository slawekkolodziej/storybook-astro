import { describe, expect, test } from 'vitest';
import {
  resolveSanitizationOptions,
  sanitizeRenderPayload,
  serializeSanitizationOptions
} from '@astrostory/core/sanitization.ts';

describe('sanitization', () => {
  test('keeps sanitization disabled by default', () => {
    const options = resolveSanitizationOptions();

    expect(options.enabled).toBe(false);
    expect(options.args).toEqual([]);
    expect(options.slots).toEqual([]);
  });

  test('sanitizes only configured arg paths', () => {
    const options = resolveSanitizationOptions({
      args: ['content']
    });

    const payload = sanitizeRenderPayload(
      {
        args: {
          content: '<p>Hello</p><script>alert(1)</script>',
          title: '<b>Keep me</b>'
        },
        slots: {}
      },
      options
    );

    expect(payload.args.content).toBe('<p>Hello</p>');
    expect(payload.args.title).toBe('<b>Keep me</b>');
  });

  test('supports wildcard patterns for nested values', () => {
    const options = resolveSanitizationOptions({
      args: ['items.*.html']
    });

    const payload = sanitizeRenderPayload(
      {
        args: {
          items: [{ html: '<img class="hero" src="x" onerror="alert(1)"><p>Safe</p>' }]
        },
        slots: {}
      },
      options
    );

    expect(payload.args.items).toEqual([{ html: '<img class="hero" src="x" /><p>Safe</p>' }]);
  });

  test('sanitizes configured slot names', () => {
    const options = resolveSanitizationOptions({
      slots: ['default']
    });

    const payload = sanitizeRenderPayload(
      {
        args: {},
        slots: {
          default: '<p>Body<script>alert(1)</script></p>',
          footer: '<p>Footer<script>alert(1)</script></p>'
        }
      },
      options
    );

    expect(payload.slots.default).toBe('<p>Body</p>');
    expect(payload.slots.footer).toBe('<p>Footer<script>alert(1)</script></p>');
  });

  test('sanitizes all slots by default when sanitization is enabled', () => {
    const options = resolveSanitizationOptions({
      enabled: true
    });

    const payload = sanitizeRenderPayload(
      {
        args: {},
        slots: {
          main: '<strong>Content in a slot!</strong><script>alert(42);</script>'
        }
      },
      options
    );

    expect(payload.slots.main).toBe('<strong>Content in a slot!</strong>');
  });

  test('rejects function-valued sanitize-html options', () => {
    expect(() =>
      resolveSanitizationOptions({
        sanitizeHtml: {
          exclusiveFilter: () => false
        }
      })
    ).toThrow(/cannot contain functions/);
  });

  test('serializes regex options for the server build virtual module', () => {
    const serialized = serializeSanitizationOptions({
      sanitizeHtml: {
        allowedStyles: {
          '*': {
            color: [/^#(?:[0-9a-f]{3}){1,2}$/i]
          }
        }
      }
    });

    expect(serialized).toContain('/^#(?:[0-9a-f]{3}){1,2}$/i');
  });
});
