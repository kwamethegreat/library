import { Code2, FileArchive, FileCode2, Lock, PlayCircle, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LockedBadge } from "@/components/ui/LockedBadge";
import { cn } from "@/lib/utils";
import type {
  CodeAssetKind,
  CodeAssetMeta,
  LessonOutlineWithAssets,
  ModuleOutline,
} from "@/types/content";

const ASSET_KIND_ICON: Record<CodeAssetKind, LucideIcon> = {
  snippet: Code2,
  file: FileArchive,
  repo: FileCode2,
  config: Settings2,
};

interface CourseModuleListProps {
  modules: ModuleOutline[];
}

/**
 * The course outline: modules -> lessons -> included code assets.
 *
 * PAYWALL UX -- paid lessons and paid code assets are rendered as LOCKED, not
 * hidden. Everything here is metadata only (title, kind, language); no lesson
 * body and no code ever reaches this component, by construction: the types it
 * accepts (LessonOutlineWithAssets / CodeAssetMeta) don't carry those fields.
 * That's what makes "advertise the locked content" safe.
 *
 * Free lessons link to the lesson page. Locked lessons deliberately do NOT
 * link -- the unlock CTA is the job of item 112.
 */
export function CourseModuleList({ modules }: CourseModuleListProps) {
  if (modules.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
        The curriculum for this challenge is being finalised. Check back soon.
      </p>
    );
  }

  return (
    <ol className="space-y-6">
      {modules.map((module, index) => (
        <li
          key={module.id}
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          {/* Module header */}
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-base font-semibold text-foreground">
                {module.title}
              </h3>
            </div>
            {module.description ? (
              <p className="mt-1 pl-8 text-sm text-muted-foreground">
                {module.description}
              </p>
            ) : null}
          </div>

          {/* Lessons */}
          {module.lessons.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted-foreground">
              Lessons coming soon.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {module.lessons.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

function LessonRow({ lesson }: { lesson: LessonOutlineWithAssets }) {
  const isLocked = lesson.access_level !== "free";

  return (
    <li className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {lesson.lesson_number}
            </span>

            <span
              className={cn(
                "text-sm font-medium",
                isLocked ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {lesson.title}
            </span>

            {lesson.has_video ? (
              <PlayCircle
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-label="Includes video"
              />
            ) : null}

            {lesson.is_public_preview ? (
              <span className="rounded border border-success px-1.5 py-0.5 text-[10px] font-medium text-success">
                Free preview
              </span>
            ) : null}
          </div>

          {lesson.summary ? (
            <p className="mt-1 pl-6 text-sm text-muted-foreground">
              {lesson.summary}
            </p>
          ) : null}

          {/* Included code assets for this lesson */}
          {lesson.codeAssets.length > 0 ? (
            <ul className="mt-3 space-y-1.5 pl-6">
              {lesson.codeAssets.map((asset) => (
                <CodeAssetRow key={asset.id} asset={asset} />
              ))}
            </ul>
          ) : null}
        </div>

        <LockedBadge accessLevel={lesson.access_level} />
      </div>
    </li>
  );
}

function CodeAssetRow({ asset }: { asset: CodeAssetMeta }) {
  const Icon = ASSET_KIND_ICON[asset.asset_kind];
  const isLocked = asset.access_level !== "free";

  return (
    <li className="flex items-center gap-2 text-xs">
      <Icon
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className={isLocked ? "text-muted-foreground" : "text-foreground"}>
        {asset.title}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">
        {asset.language}
      </span>
      {isLocked ? (
        <Lock className="h-3 w-3 shrink-0 text-accent" aria-label="Locked" />
      ) : null}
    </li>
  );
}
