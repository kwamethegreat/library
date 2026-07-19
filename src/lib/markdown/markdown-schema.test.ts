import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";

import { lessonMarkdownSchema } from "@/lib/markdown/markdown-schema";

/**
 * SECURITY TESTS -- the XSS boundary for author-authored lesson content.
 *
 * `lessons.body_markdown` is author-controlled and rendered as HTML, so
 * markdown-schema.ts is what stops a malicious/compromised author payload from
 * injecting script, event handlers, or dangerous URLs into a viewer's page.
 *
 * These run the SAME plugin pipeline the Markdown component uses -- remark-gfm
 * -> rehype-highlight -> rehype-sanitize(schema) -- and assert on the emitted
 * HTML. No DOM required: the pipeline is pure, so these run in the existing
 * `node` test environment with no extra dependencies.
 *
 * If a future change to the schema reopens one of these holes, CI fails here.
 */
async function render(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    // Order matters: highlight FIRST, then sanitize validates what it emitted.
    .use(rehypeHighlight)
    .use(rehypeSanitize, lessonMarkdownSchema)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

describe("lesson markdown sanitization -- blocks injection", () => {
  it("strips <script> tags entirely", async () => {
    const html = await render("Hello\n\n<script>alert(1)</script>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });

  it("strips javascript: hrefs but may keep the link text", async () => {
    const html = await render("[click me](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
    // The anchor may survive without an href -- what matters is no JS URL.
    expect(html).toContain("click me");
  });

  it("strips inline event handlers", async () => {
    const html = await render('<img src=x onerror="alert(1)">');
    expect(html.toLowerCase()).not.toContain("onerror");
    expect(html).not.toContain("alert(1)");
  });

  it("strips <iframe> embeds", async () => {
    const html = await render('<iframe src="https://evil.example"></iframe>');
    expect(html).not.toContain("<iframe");
  });

  it("strips style attributes (CSS-based attacks)", async () => {
    const html = await render(
      '<p style="background:url(javascript:alert(1))">x</p>',
    );
    expect(html).not.toContain("style=");
    expect(html).not.toContain("javascript:");
  });

  it("strips data: URIs in links", async () => {
    const html = await render(
      "[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)",
    );
    expect(html).not.toContain("data:text/html");
  });

  it("strips <form> and input elements", async () => {
    const html = await render(
      '<form action="https://evil.example"><input name="pw"></form>',
    );
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<input");
  });
});

describe("lesson markdown sanitization -- preserves legitimate content", () => {
  it("keeps basic formatting", async () => {
    const html = await render("**bold** and _italic_");
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
  });

  it("keeps headings and lists", async () => {
    const html = await render("## Heading\n\n- one\n- two");
    expect(html).toContain("<h2>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
  });

  it("keeps safe http/https links", async () => {
    const html = await render("[docs](https://example.com/docs)");
    expect(html).toContain('href="https://example.com/docs"');
  });

  it("keeps gfm tables", async () => {
    const html = await render("| a | b |\n| - | - |\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>");
  });

  it("keeps inline code", async () => {
    const html = await render("use `npm install` first");
    expect(html).toContain("<code>npm install</code>");
  });
});

describe("lesson markdown sanitization -- syntax highlighting survives", () => {
  /**
   * The schema deliberately allows `language-*` / `hljs*` classes so
   * rehype-highlight's output isn't scrubbed. If someone tightens the schema
   * without accounting for this, highlighting silently breaks -- these tests
   * catch that.
   */
  it("keeps the language class on fenced code", async () => {
    const html = await render("```tsx\nconst x = 1;\n```");
    expect(html).toMatch(/class="[^"]*language-tsx/);
  });

  it("keeps hljs token spans", async () => {
    const html = await render("```js\nconst x = 1;\n```");
    expect(html).toContain('<span class="hljs');
  });

  it("does NOT allow arbitrary classes on code", async () => {
    // Only language-* / hljs* are permitted; anything else must be dropped.
    const html = await render('<code class="evil-class">x</code>');
    expect(html).not.toContain("evil-class");
  });
});

describe("lesson markdown sanitization -- malformed input degrades safely", () => {
  it("handles an unterminated code fence", async () => {
    const html = await render("```js\nconst x = 1;");
    expect(html).toContain("<code");
  });

  it("handles an unknown highlight language", async () => {
    const html = await render("```notarealthing\nfoo\n```");
    expect(html).toContain("<code");
  });

  it("handles unclosed html", async () => {
    await expect(render("<div><span>unclosed")).resolves.toBeTypeOf("string");
  });

  it("handles empty input", async () => {
    await expect(render("")).resolves.toBeTypeOf("string");
  });
});
