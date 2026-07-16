import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface LessonWorkspaceProps {
  /** Left pane: media / theory (video, markdown, architecture notes). ~45%. */
  leftPane: ReactNode;
  /** Right pane: code / terminal (repo preview, copy, output). ~55%. */
  rightPane: ReactNode;
  /** Optional header strip above the split (breadcrumb, title, lesson nav). */
  header?: ReactNode;
  className?: string;
}

/**
 * The split-view lesson workspace SHELL (item 114).
 *
 * Geometry: left 45% (media/theory) | right 55% (code/terminal), matching the
 * "read on the left, build on the right" model. The split only applies at lg+;
 * below that the panes STACK vertically (left/theory first) so the layout stays
 * usable on a phone instead of crushing two narrow columns side by side.
 *
 * This is intentionally a dumb container: it owns geometry only. The panes'
 * actual contents -- video player, markdown renderer, code preview, terminal --
 * are composed in by items 115-119 and passed as `leftPane` / `rightPane`. Any
 * interactivity those bring (copy button, terminal) lives in THEIR client
 * components; this shell stays a Server Component.
 *
 * Height: on lg+ the split fills the viewport below the site header and each
 * pane scrolls independently, so long theory doesn't push the code out of view.
 */
export function LessonWorkspace({
  leftPane,
  rightPane,
  header,
  className,
}: LessonWorkspaceProps) {
  return (
    <div className={cn("flex min-h-[calc(100vh-4rem)] flex-col", className)}>
      {header ? (
        <div className="border-b border-border bg-surface">{header}</div>
      ) : null}

      {/* Stack on small screens; split at lg+. */}
      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Left pane -- media / theory (~45%) */}
        <section
          aria-label="Lesson theory and media"
          className={cn(
            "border-border lg:w-[45%] lg:overflow-y-auto lg:border-r",
            // On stacked (mobile) layout the divider sits at the bottom instead.
            "border-b lg:border-b-0",
          )}
        >
          {leftPane}
        </section>

        {/* Right pane -- code / terminal (~55%) */}
        <section
          aria-label="Lesson code and workspace"
          className="bg-surface lg:w-[55%] lg:overflow-y-auto"
        >
          {rightPane}
        </section>
      </div>
    </div>
  );
}

/**
 * Placeholder pane content for the shell before 115/116 fill it. Keeps the
 * route renderable and the geometry visible while the panes are built out.
 */
export function WorkspacePanePlaceholder({
  label,
  hint,
}: {
  label: string;
  hint: string;
}) {
  return (
    <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-2 p-8 text-center">
      <span className="rounded border border-dashed border-border px-2 py-1 font-mono text-xs text-muted-foreground">
        {label}
      </span>
      <p className="max-w-xs text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
