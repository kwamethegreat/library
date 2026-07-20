import { Lock } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PAYWALL_INTENT_COPY } from "@/types/access";

interface LessonPaywallNoticeProps {
  /** Whether the viewer has a session (drives signup vs upgrade). */
  isAuthenticated: boolean;
  /** Course to return to, if known. */
  courseSlug?: string;
}

/**
 * Inline paywall shown in place of a locked lesson's body (item 131).
 *
 * This is the STATIC, always-rendered locked state. The interactive
 * ProgressFreezeModal that fires on a gated action (copy, download, run tests)
 * is item 132 -- this notice is what a viewer sees simply for landing on a paid
 * lesson they aren't entitled to.
 *
 * Server Component. Copy for the blocked action comes from the shared
 * PAYWALL_INTENT_COPY map so wording stays consistent with the modal.
 */
export function LessonPaywallNotice({
  isAuthenticated,
  courseSlug,
}: LessonPaywallNoticeProps) {
  const { explanation } = PAYWALL_INTENT_COPY.open_paid_lesson;

  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Lock className="h-5 w-5 text-accent" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-foreground">
        This lesson is locked
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {explanation} Subscribe to unlock the full lesson, its code assets, and
        every other paid challenge.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {isAuthenticated ? (
          <Link
            href="/signup"
            className={buttonVariants({ variant: "default" })}
          >
            Upgrade to unlock
          </Link>
        ) : (
          <Link
            href="/signup"
            className={buttonVariants({ variant: "default" })}
          >
            Create an account
          </Link>
        )}
        {courseSlug ? (
          <Link
            href={`/courses/${courseSlug}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Back to course
          </Link>
        ) : null}
      </div>
    </div>
  );
}
