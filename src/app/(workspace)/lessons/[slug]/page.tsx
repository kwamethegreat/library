import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/markdown/Markdown";
import { MarkdownBoundary } from "@/components/markdown/MarkdownBoundary";
import { LessonCodePane } from "@/components/workspace/LessonCodePane";
import { LessonPaywallNotice } from "@/components/workspace/LessonPaywallNotice";
import { LessonTheoryPane } from "@/components/workspace/LessonTheoryPane";
import { LessonVideo } from "@/components/workspace/LessonVideo";
import { LessonWorkspace } from "@/components/workspace/LessonWorkspace";
import { getLessonForViewer } from "@/lib/db";
import { getViewerEntitlement } from "@/lib/entitlement";

/**
 * PLACEHOLDER sample code for the right-pane preview. Real content will come
 * from the free code assets attached to the lesson (code_assets.code_body) in a
 * later step. When that lands, delete this constant and pass the fetched asset.
 */
const SAMPLE_CODE = `export function Hello() {
  return <h1>Hello, world</h1>;
}`;

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getLessonForViewer(slug);

  if (!result) {
    return { title: "Lesson not found" };
  }

  return {
    title: result.meta.title,
    description: result.meta.summary ?? undefined,
  };
}

/**
 * Lesson workspace page with SERVER-SIDE access enforcement (item 131).
 *
 * A paid lesson no longer 404s. It resolves for everyone, but:
 *   - entitled viewers get the full body + video,
 *   - everyone else gets metadata (title, summary) plus a paywall notice.
 *
 * The payload is gated in POSTGRES (get_lesson_content), not just here -- see
 * getLessonForViewer. This page decides what to RENDER; the database decides
 * what may be READ. A genuinely missing/unpublished lesson still 404s.
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const result = await getLessonForViewer(slug);

  if (!result) {
    notFound();
  }

  const { meta, content } = result;
  // `content === null` is the AUTHORITATIVE lock signal: it reflects what the
  // database actually returned, so it stays correct even if the app-side
  // classification and the DB gate ever disagreed (getLessonForViewer downgrades
  // to locked in that case). Don't swap this for the app-side accessState.
  const isLocked = content === null;
  const entitlement = await getViewerEntitlement();

  return (
    <LessonWorkspace
      header={
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href={`/courses/${meta.course_slug}`}
            className="truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {meta.course_title}
          </Link>
          <span className="text-xs text-muted-foreground" aria-hidden="true">
            /
          </span>
          <h1 className="truncate text-sm font-medium text-foreground">
            {meta.title}
          </h1>
        </div>
      }
      leftPane={
        <LessonTheoryPane
          title={meta.title}
          summary={meta.summary}
          lessonNumber={meta.lesson_number}
          hasVideo={meta.has_video}
          videoProvider={meta.video_provider}
          video={
            // Only entitled viewers get a real player. A locked lesson shows
            // the empty frame -- the video id is never sent to the client.
            content?.video_asset_id ? (
              <LessonVideo
                provider={content.video_provider}
                videoId={content.video_asset_id}
              />
            ) : undefined
          }
          body={
            isLocked ? (
              <LessonPaywallNotice
                isAuthenticated={entitlement.isAuthenticated}
                courseSlug={meta.course_slug}
              />
            ) : content.body_markdown ? (
              <MarkdownBoundary>
                <Markdown content={content.body_markdown} />
              </MarkdownBoundary>
            ) : undefined
          }
        />
      }
      rightPane={
        <LessonCodePane
          preview={
            // Locked lessons get no code preview at all (item 133 will add the
            // interactive paywall on copy/download intents).
            isLocked
              ? undefined
              : {
                  filename: "hello.tsx",
                  language: "tsx",
                  isSample: true,
                  code: SAMPLE_CODE,
                }
          }
        />
      }
    />
  );
}
