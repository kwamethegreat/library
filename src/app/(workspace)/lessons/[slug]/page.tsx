import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  LessonWorkspace,
  WorkspacePanePlaceholder,
} from "@/components/workspace/LessonWorkspace";
import { getLessonBySlug } from "@/lib/db";

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    return { title: "Lesson not found" };
  }

  return {
    title: lesson.title,
    description: lesson.summary ?? undefined,
  };
}

/**
 * Lesson workspace page (item 114 -- SHELL ONLY).
 *
 * Mounts the split-view with placeholder panes. Items 115-119 replace the
 * placeholders with the real left pane (video + markdown theory) and right pane
 * (code preview + terminal), and item 118/120 add the entitlement-gated content
 * path for PAID lessons.
 *
 * PAYWALL NOTE: getLessonBySlug runs through the RLS client, which (after the
 * item 110 paywall fix) can only see FREE published lessons. So a paid lesson
 * currently 404s here -- correct and intended: paid lesson bodies must come from
 * a server-side entitlement check that doesn't exist yet. Do not "fix" this by
 * switching to the admin client.
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  return (
    <LessonWorkspace
      header={
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/catalog"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Catalog
          </Link>
          <span className="text-xs text-muted-foreground" aria-hidden="true">
            /
          </span>
          <h1 className="truncate text-sm font-medium text-foreground">
            {lesson.title}
          </h1>
        </div>
      }
      leftPane={
        <WorkspacePanePlaceholder
          label="LEFT PANE / theory"
          hint="Video player, markdown theory, and architecture notes land here (items 115, 118, 119)."
        />
      }
      rightPane={
        <WorkspacePanePlaceholder
          label="RIGHT PANE / code"
          hint="Code preview, copy button, and terminal output panel land here (item 116)."
        />
      }
    />
  );
}
