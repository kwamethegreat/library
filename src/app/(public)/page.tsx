import { Suspense } from "react";

import {
  CourseRoadmapPreview,
  CourseRoadmapPreviewSkeleton,
} from "@/components/home/CourseRoadmapPreview";
import { FAQ } from "@/components/home/FAQ";
import { FreeLessonCTA } from "@/components/home/FreeLessonCTA";
import { HeroSection } from "@/components/home/HeroSection";
import { PlatformPreview } from "@/components/home/PlatformPreview";
import { PricingTeaser } from "@/components/home/PricingTeaser";

/**
 * Homepage. Fully server-rendered: every section below is a Server Component
 * and none of them import dashboard / workspace / admin code (item 108). The
 * FAQ uses native <details> rather than a client accordion for the same reason.
 *
 * Only CourseRoadmapPreview touches the DB, so it's the only thing wrapped in
 * <Suspense> -- the static sections paint immediately while it streams in.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PlatformPreview />
      <FreeLessonCTA />

      <Suspense fallback={<CourseRoadmapPreviewSkeleton />}>
        <CourseRoadmapPreview />
      </Suspense>

      <PricingTeaser />
      <FAQ />
    </>
  );
}
