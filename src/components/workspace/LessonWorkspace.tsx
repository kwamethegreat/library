import type { ReactNode } from "react";

import { WorkspaceResponsive } from "@/components/workspace/WorkspaceResponsive";
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
 * The lesson workspace SHELL (item 114) with responsive behavior (item 121).
 *
 * Server Component. It owns the outer frame (height, optional header) and hands
 * the two panes to WorkspaceResponsive, which does the responsive switch:
 * Lesson | Code tabs below lg, 45/55 split at lg+. Interactivity (tab state)
 * lives only in that client child; the pane CONTENTS pass through as
 * server-rendered nodes, so no lesson content ships as client JS.
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
        <div
          role="region"
          aria-label="Lesson navigation"
          className="border-b border-border bg-surface"
        >
          {header}
        </div>
      ) : null}

      <WorkspaceResponsive lesson={leftPane} code={rightPane} />
    </div>
  );
}

/**
 * Placeholder pane content for scaffolding new panes before they are filled.
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
