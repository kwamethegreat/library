import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

/**
 * Homepage hero. Server component -- no interactivity, no client JS.
 *
 * CTA targets (finalised in item 107):
 *  - "Watch Free Lesson" -> the free lesson route doesn't exist until Phase 5,
 *    so for now it points at the catalog filtered to free courses.
 *  - "Browse Curriculum" -> /catalog.
 */
export function HeroSection() {
  return (
    <Section spacing="spacious">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Badge variant="outline" className="border-accent text-accent">
          Now in development
        </Badge>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Build the systems most engineers only read about
        </h1>

        <p className="max-w-xl text-muted-foreground">
          Guided, hands-on challenges with real code, a split-view workspace,
          and a vault of production-grade assets you keep. Start with a free
          lesson -- no card required.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/catalog?access=free"
            className={buttonVariants({ variant: "default", size: "lg" })}
          >
            Watch Free Lesson
          </Link>
          <Link
            href="/catalog"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Browse Curriculum
          </Link>
        </div>
      </Container>
    </Section>
  );
}
