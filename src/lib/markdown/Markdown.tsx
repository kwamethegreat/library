import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { lessonMarkdownSchema } from "@/lib/markdown/markdown-schema";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  /** Raw markdown source (e.g. lessons.body_markdown). */
  content: string;
  className?: string;
}

type AnchorProps = ComponentPropsWithoutRef<"a">;

/**
 * Renders trusted-source markdown SAFELY.
 *
 * Pipeline: remark-gfm (tables, strikethrough, task lists, autolinks) ->
 * rehype-sanitize with our own allow-list schema (see markdown-schema.ts).
 * Sanitization runs on the HAST AFTER parsing, so anything not on the allow-list
 * is dropped -- this is the XSS boundary for author-authored lesson content.
 *
 * Syntax highlighting of fenced code is added in item 118 by inserting a rehype
 * highlighter BEFORE sanitize in the pipeline; the schema already permits the
 * highlighter's `language-*` / `hljs*` classes.
 *
 * A Server Component -- no client JS. Prose styling is applied via wrapper
 * classes rather than a plugin so we keep full control of the design tokens.
 */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        // Base prose rhythm using design tokens (no external prose plugin).
        "space-y-4 text-sm leading-relaxed text-foreground",
        "[&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-foreground",
        "[&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground",
        "[&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground",
        "[&_p]:text-muted-foreground",
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-muted-foreground",
        "[&_li]:mt-1",
        "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        // Inline code
        "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-xs [&_:not(pre)>code]:text-foreground",
        // Fenced code blocks
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-background [&_pre]:p-4",
        "[&_pre_code]:font-mono [&_pre_code]:text-xs [&_pre_code]:leading-relaxed",
        // Tables (gfm)
        "[&_table]:w-full [&_table]:border-collapse [&_table]:text-xs",
        "[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:text-foreground",
        "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-muted-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, lessonMarkdownSchema]]}
        components={{
          // Harden links: external, no referrer/opener leakage. Sanitize has
          // already guaranteed href is a safe protocol.
          a: ({ href, children, ...rest }: AnchorProps) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              {...rest}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
