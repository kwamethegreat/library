/**
 * Instant loading skeleton for the lesson workspace route (item 124). Rendered
 * while the server component resolves the lesson. Mirrors the workspace shape:
 * a header strip, then a split (theory left, code right) at lg+, stacked below.
 *
 * aria-hidden -- decorative placeholder; the real content announces on load.
 */
export default function LessonLoading() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-[calc(100vh-4rem)] animate-pulse flex-col"
    >
      {/* Header strip */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
      </div>

      {/* Split body */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left: theory */}
        <div className="space-y-6 p-6 md:p-8 lg:w-[45%] lg:border-r lg:border-border">
          <div>
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="mt-2 h-7 w-2/3 rounded bg-muted" />
            <div className="mt-3 h-4 w-full rounded bg-muted" />
          </div>
          {/* Video frame */}
          <div className="aspect-video w-full rounded-xl bg-muted" />
          {/* Body lines */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-11/12 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>

        {/* Right: code */}
        <div className="space-y-6 bg-surface p-6 md:p-8 lg:w-[55%]">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="border-b border-border bg-surface px-4 py-2">
              <div className="h-4 w-40 rounded bg-muted" />
            </div>
            <div className="space-y-2 p-4">
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="border-b border-border bg-surface px-4 py-2">
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="space-y-2 p-4">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
