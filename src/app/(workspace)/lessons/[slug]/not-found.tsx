import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

/**
 * Lesson-specific not-found (item 124). Triggered by notFound() in the lesson
 * page -- unknown slug, unpublished lesson, or (by current design) a PAID lesson
 * the RLS client can't see. Lives in the (workspace) route group, so it renders
 * inside the minimal workspace chrome rather than the marketing layout.
 *
 * Copy stays deliberately neutral: it must NOT imply "this is paid, subscribe"
 * (that would leak which slugs are paid). "Not available" covers missing,
 * unpublished, and not-yet-entitled alike.
 */
export default function LessonNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Lesson not available
      </h1>
      <p className="max-w-md text-muted-foreground">
        This lesson doesn&apos;t exist or isn&apos;t available to view. Head back
        to the catalog to keep learning.
      </p>
      <Link href="/catalog" className={buttonVariants({ variant: "default" })}>
        Browse catalog
      </Link>
    </main>
  );
}
