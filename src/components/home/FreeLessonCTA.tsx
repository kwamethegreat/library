import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { buttonVariants } from "@/components/ui/button";

/**
 * Mid-page conversion band: the top of the commercial loop (Visitor -> Free
 * Lesson 1). Server component -- no client JS.
 *
 * TODO(item 107 / Phase 5): point at the real free lesson route once
 * /lessons/[slug] exists. Until then this lands on the free-filtered catalog.
 */
export function FreeLessonCTA() {
  return (
    <Section>
      <Container>
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-surface px-6 py-12 text-center">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Start with the first lesson. It&apos;s free.
          </h2>
          <p className="max-w-lg text-muted-foreground">
            No card, no trial timer. Work through a complete challenge end to
            end and keep whatever you build.
          </p>
          <Link
            href="/catalog?access=free"
            className={buttonVariants({ variant: "default", size: "lg" })}
          >
            Watch Free Lesson
          </Link>
        </div>
      </Container>
    </Section>
  );
}
