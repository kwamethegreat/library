import { Code2 } from "lucide-react";
import Link from "next/link";

import { LockedBadge } from "@/components/ui/LockedBadge";
import { cn } from "@/lib/utils";
import type {
  CourseCardData,
  CourseLevel,
  ValidationLabStatus,
} from "@/types/content";

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const LAB_STATUS: Record<
  ValidationLabStatus,
  { label: string; className: string; dot: string }
> = {
  active: {
    label: "Lab active",
    className: "text-success",
    dot: "bg-success",
  },
  draft: {
    label: "Lab draft",
    className: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  archived: {
    label: "Lab archived",
    className: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  none: {
    label: "No lab",
    className: "text-muted-foreground",
    dot: "bg-border",
  },
};

interface CourseCardProps {
  course: CourseCardData;
  /** Link target; defaults to /courses/<slug>. */
  href?: string;
}

/**
 * Operational catalog card. Surfaces the technical/ops fields:
 * - System Moat Identifier (monospace tag)
 * - Challenge Title (the course title)
 * - Validation Lab Status (color-coded)
 * - Code Asset Flag (shown only when the course ships code assets)
 * plus level and a LockedBadge for gated tiers. Deliberately NO review stars,
 * ratings, or generic engagement metrics.
 */
export function CourseCard({ course, href }: CourseCardProps) {
  const target = href ?? `/courses/${course.slug}`;
  const lab = LAB_STATUS[course.validation_lab_status];

  return (
    <Link
      href={target}
      className="group block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-muted-foreground"
    >
      {/* Top row: system moat identifier + locked badge */}
      <div className="mb-3 flex items-start justify-between gap-2">
        {course.system_moat_identifier ? (
          <span className="font-mono text-xs tracking-tight text-muted-foreground">
            {course.system_moat_identifier}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <LockedBadge accessLevel={course.access_level} />
      </div>

      {/* Challenge title */}
      <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-accent">
        {course.title}
      </h3>

      {/* Footer: level, lab status, code asset flag */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="text-muted-foreground">
          {LEVEL_LABELS[course.level]}
        </span>

        <span
          className={cn("inline-flex items-center gap-1.5", lab.className)}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", lab.dot)}
            aria-hidden="true"
          />
          {lab.label}
        </span>

        {course.code_asset_flag && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
            Code assets
          </span>
        )}
      </div>
    </Link>
  );
}
