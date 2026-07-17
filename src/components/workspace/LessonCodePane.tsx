import { Terminal } from "lucide-react";
import type { ReactNode } from "react";

import { CopyButton } from "@/components/workspace/CopyButton";
import { cn } from "@/lib/utils";

interface CodePreview {
  /** File/asset name shown in the code block header. */
  filename: string;
  /** Language label (e.g. "tsx", "json"). */
  language: string;
  /** The code to show + copy. */
  code: string;
  /**
   * Marks the code as placeholder sample data (item 116 uses hardcoded sample
   * code; real code_assets.code_body wiring comes later). Shows a "sample" tag
   * so baked-in content is never mistaken for wired-up data.
   */
  isSample?: boolean;
}

interface LessonCodePaneProps {
  /**
   * The code preview to render. Optional: absent for lessons with no code, or
   * for LOCKED lessons whose code_body the RLS client can't see (paywall).
   */
  preview?: CodePreview;
  /** Extra content below the terminal (e.g. Code Vault list later). */
  children?: ReactNode;
  className?: string;
}

/**
 * Right pane of the lesson workspace (item 116): code + terminal column.
 *
 * Server Component. The only interactive piece is the CopyButton leaf. Two
 * regions:
 *   1. Code preview  -- filename header + copy + code block
 *   2. Terminal      -- simulated static output (labelled), MVP per roadmap
 *
 * PAYWALL NOTE: real code content is a PAID payload (code_assets.code_body),
 * which the RLS client only sees for FREE assets. `preview` is optional so a
 * locked lesson can render the empty/locked state instead. Do not require it.
 */
export function LessonCodePane({
  preview,
  children,
  className,
}: LessonCodePaneProps) {
  return (
    <div className={cn("flex flex-col gap-6 p-6 md:p-8", className)}>
      {preview ? <CodePreviewBlock preview={preview} /> : <CodeEmptyState />}

      <SimulatedTerminal />

      {children}
    </div>
  );
}

function CodePreviewBlock({ preview }: { preview: CodePreview }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Header: filename, language, sample tag, copy */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-xs text-foreground">
            {preview.filename}
          </span>
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {preview.language}
          </span>
          {preview.isSample ? (
            <span className="shrink-0 rounded border border-dashed border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              sample
            </span>
          ) : null}
        </div>
        <CopyButton value={preview.code} className="shrink-0" />
      </div>

      {/* Code body. Plain <pre> for now; syntax highlighting is item 117/118. */}
      <pre className="overflow-x-auto bg-background p-4 text-sm leading-relaxed">
        <code className="font-mono text-foreground">{preview.code}</code>
      </pre>
    </div>
  );
}

function CodeEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      No code preview for this lesson.
    </div>
  );
}

/** Simulated (non-functional) terminal output. Static content for MVP. */
const SIMULATED_LINES = [
  { prompt: "$", text: "npm install" },
  { prompt: "", text: "added 312 packages in 4s" },
  { prompt: "$", text: "npm run dev" },
  { prompt: "", text: "ready - started server on http://localhost:3000" },
] as const;

function SimulatedTerminal() {
  return (
    <section
      aria-label="Terminal output (simulated)"
      className="overflow-hidden rounded-xl border border-border"
    >
      {/* Terminal chrome */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal
            className="h-3.5 w-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="font-mono text-xs text-muted-foreground">
            terminal
          </span>
        </div>
        <span className="rounded border border-dashed border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
          simulated
        </span>
      </div>

      {/*
        Output is a live LOG region: `aria-live="polite"` so future streamed
        output (real command output, once validation labs exist) is announced
        to assistive tech without stealing focus; `role="log"` marks it as an
        append-only sequence. Today the lines are static, but wiring the region
        now means the terminal is accessible the moment it becomes dynamic.
      */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Command output"
        aria-atomic="false"
        className="bg-background p-4 font-mono text-xs leading-relaxed"
      >
        {SIMULATED_LINES.map((line, index) => (
          <div key={index} className="flex gap-2">
            {line.prompt ? (
              <span className="shrink-0 text-accent" aria-hidden="true">
                {line.prompt}
              </span>
            ) : (
              <span className="shrink-0" aria-hidden="true">
                {"\u00a0"}
              </span>
            )}
            <span className="text-muted-foreground">{line.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
