import type { Options as SanitizeSchema } from "rehype-sanitize";
import { defaultSchema } from "rehype-sanitize";

/**
 * SANITIZATION SCHEMA -- security boundary.
 *
 * `lessons.body_markdown` is author-controlled content rendered as HTML, so
 * this schema is the line that stops a malicious/compromised author payload
 * from injecting script, event handlers, or dangerous URLs into a viewer's
 * page. It is intentionally in its own file so the security surface is small,
 * obvious, and reviewed as one thing.
 *
 * We start from hast-util-sanitize's `defaultSchema` (a conservative allow-list
 * that already strips <script>, on* handlers, and unsafe href/src protocols --
 * javascript:, data:, etc.) and make ONLY the minimal additions needed for
 * technical lesson content:
 *
 *   - code:  allow className, but ONLY the highlighter's `language-*` / `hljs*`
 *            classes (item 118 highlighting). The default already allows a bare
 *            className on <code>; we tighten it to a prefix allow-list.
 *   - span:  the default forbids className on <span>; highlighters wrap tokens
 *            in <span class="hljs-...">, so we permit ONLY `hljs*` classes.
 *
 * We do NOT loosen anything else. In particular we never add `style`, never
 * broaden href/src protocols, and never allow raw HTML pass-through.
 *
 * If you are tempted to widen this schema, stop: every added tag/attribute is a
 * potential XSS vector against every lesson viewer. Prefer a remark/rehype
 * plugin that produces already-safe output over relaxing the allow-list.
 *
 * markdown-schema.test.ts locks this behaviour into CI -- both directions:
 * injection stays blocked, AND the highlighter's classes keep working.
 *
 * NOTE: typed as SanitizeSchema (rehype-sanitize's own `Options`) rather than
 * using `as const`. A deeply-readonly `as const` object is not assignable to
 * the mutable Schema that unified's `.use()` expects, which breaks typecheck in
 * the tests.
 */
export const lessonMarkdownSchema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Restrict code classes to highlighter prefixes (was: any className).
    code: [["className", /^language-/, /^hljs/]],
    // Allow token spans from the highlighter, nothing else.
    span: [["className", /^hljs/]],
  },
};
