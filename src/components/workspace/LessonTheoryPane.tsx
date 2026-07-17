import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { VideoProvider } from "@/types/content";

interface LessonTheoryPaneProps {
  title: string;
  summary: string | null;
  lessonNumber: number;

  /**
   * The rendered video player. Slot, not implementation -- item 119 provides
   * the real player; a null here shows the empty video frame (e.g. a lesson
   * with no video, or before 119 lands).
   */
  video?: ReactNode;
  /** Whether a video EXISTS (drives the empty-frame message). Metadata only. */
  hasVideo?: boolean;
  videoProvider?: VideoProvider | null;

  /**
   * The rendered theory body. Slot, not implementation -- item 118 renders
   * `lessons.body_markdown` here via the sanitized markdown renderer (item 117).
   *
   * PAYWALL NOTE: body content is a PAID payload. It only exists for lessons the
   * caller is entitled to; for locked lessons this is absent BY DESIGN. Typed
   * optional so no code path is tempted to require it. Do not add a
   * `bodyMarkdown: string` prop and render it directly -- that must go through
   * the entitlement-checked path.
   */
  body?: ReactNode;

  /**
   * Optional architecture notes (system-design context, diagrams). Slot filled
   * by later content; hidden entirely when absent.
   */
  architectureNotes?: ReactNode;

  className?: string;
}

/**
 * Left pane of the lesson workspace (item 115): media/theory column.
 *
 * Structure only -- three stacked regions:
 *   1. Video frame (slot -> item 119)
 *   2. Theory body (slot -> item 118, rendered from sanitized markdown)
 *   3. Architecture notes (optional slot)
 *
 * Server Component. Any interactivity a slot needs (e.g. the video player)
 * lives in that slot's own component, not here.
 */
export function LessonTheoryPane({
  title,
  summary,
  lessonNumber,
  video,
  hasVideo = false,
  videoProvider,
  body,
  architectureNotes,
  className,
}: LessonTheoryPaneProps) {
  return (
    <article className={cn("flex flex-col gap-6 p-6 md:p-8", className)}>
      {/* Lesson heading */}
      <header>
        <p className="font-mono text-xs text-muted-foreground">
          Lesson {lessonNumber}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {summary ? (
          <p className="mt-2 text-muted-foreground">{summary}</p>
        ) : null}
      </header>

      {/* 1. Video frame */}
      <VideoFrame
        video={video}
        hasVideo={hasVideo}
        videoProvider={videoProvider}
      />

      {/* 2. Theory body */}
      <section aria-label="Lesson theory">
        {body ?? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Lesson content will render here.
          </div>
        )}
      </section>

      {/* 3. Architecture notes (optional) */}
      {architectureNotes ? (
        <section
          aria-label="Architecture notes"
          className="rounded-lg border border-border bg-surface p-5"
        >
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Architecture notes
          </h3>
          <div className="text-sm text-muted-foreground">
            {architectureNotes}
          </div>
        </section>
      ) : null}
    </article>
  );
}

/**
 * The 16:9 video region. Renders the provided player, or an empty frame that
 * reflects whether a video exists at all (without disclosing the asset id --
 * that's `hasVideo`, metadata only).
 */
function VideoFrame({
  video,
  hasVideo,
  videoProvider,
}: {
  video?: ReactNode;
  hasVideo: boolean;
  videoProvider?: VideoProvider | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black">
      <div className="relative aspect-video">
        {video ? (
          video
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <span className="font-mono text-xs text-muted-foreground">
              {hasVideo ? "VIDEO" : "NO VIDEO"}
            </span>
            <p className="text-xs text-muted-foreground">
              {hasVideo
                ? `Player loads here${
                    videoProvider ? ` (${videoProvider})` : ""
                  }.`
                : "This lesson has no video."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
