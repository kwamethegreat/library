import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { buttonVariants } from "@/components/ui/button";

/**
 * Course-specific not-found (item 124). Triggered by notFound() in the course
 * page when a slug is unknown or the course is unpublished. Same structure and
 * tone as the root 404, but course-flavored copy and a catalog CTA (more useful
 * than "back to home" when the user was browsing courses).
 */
export default function CourseNotFound() {
  return (
    <Section spacing="spacious">
      <Container
        size="narrow"
        className="flex flex-col items-center gap-4 text-center"
      >
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Course not found
        </h1>
        <p className="max-w-md text-muted-foreground">
          This course doesn&apos;t exist or isn&apos;t available yet. Browse the
          catalog to find something to build.
        </p>
        <Link href="/catalog" className={buttonVariants({ variant: "default" })}>
          Browse catalog
        </Link>
      </Container>
    </Section>
  );
}
