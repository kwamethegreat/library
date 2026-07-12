import { Check } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CTA, HOME_SECTION_IDS } from "@/lib/navigation/cta";

const included = [
  "Every challenge, every track",
  "Full Code Vault access -- scaffolds, configs, reference repos",
  "Validation labs on supported challenges",
  "New challenges as they ship",
] as const;

/**
 * Pricing teaser -- not the pricing page (that's item 140, Phase 7). Sets the
 * value expectation and drives signup. Server component, no client JS.
 *
 * Carries id="pricing" (scroll-margin so the sticky-ish header doesn't clip the
 * heading) because the nav/footer "Pricing" links anchor here until the real
 * /pricing route exists.
 */
export function PricingTeaser() {
  return (
    <Section id={HOME_SECTION_IDS.pricing} className="scroll-mt-20">
      <Container size="narrow">
        <div className="rounded-2xl border border-border bg-surface p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Founding Builder Pass
            </h2>
            <Badge variant="outline" className="border-accent text-accent">
              Early access
            </Badge>
          </div>

          <p className="mt-3 text-muted-foreground">
            One pass, the whole library. Founding pricing is locked in for as
            long as you stay subscribed.
          </p>

          <ul className="mt-6 space-y-3">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={CTA.foundingPass.href}
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              {CTA.foundingPass.label}
            </Link>
            <Link
              href={CTA.freeLesson.href}
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              Try a free lesson first
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
