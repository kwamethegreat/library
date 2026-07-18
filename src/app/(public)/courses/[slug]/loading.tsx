import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

/**
 * Instant loading skeleton for the course detail route (item 124). Next renders
 * this while the server component resolves getCourseWithHierarchy, so the user
 * sees the page's SHAPE immediately instead of a blank flash.
 *
 * Mirrors the real layout: overview (title, badges, meta) then a curriculum
 * list of module blocks. Purely presentational; aria-hidden so screen readers
 * announce the eventual content, not the placeholder bars.
 */
export default function CourseLoading() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      {/* Overview */}
      <Section spacing="spacious">
        <Container size="narrow">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="mt-4 h-9 w-2/3 rounded bg-muted" />
          <div className="mt-3 h-4 w-full rounded bg-muted" />
          <div className="mt-2 h-4 w-4/5 rounded bg-muted" />

          {/* Badges */}
          <div className="mt-5 flex flex-wrap gap-2">
            <div className="h-6 w-24 rounded-full bg-muted" />
            <div className="h-6 w-20 rounded-full bg-muted" />
            <div className="h-6 w-16 rounded-full bg-muted" />
          </div>

          {/* Meta row */}
          <div className="mt-6 flex gap-6">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>

          {/* CTA */}
          <div className="mt-8 h-11 w-48 rounded-md bg-muted" />
        </Container>
      </Section>

      {/* Curriculum */}
      <Section>
        <Container size="narrow">
          <div className="mb-6 h-6 w-40 rounded bg-muted" />
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`module-skeleton-${index}`}
                className="rounded-xl border border-border bg-surface"
              >
                <div className="border-b border-border px-5 py-4">
                  <div className="h-5 w-1/3 rounded bg-muted" />
                </div>
                <div className="space-y-3 px-5 py-4">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
