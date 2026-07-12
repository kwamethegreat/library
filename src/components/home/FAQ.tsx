import { ChevronDown } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const faqs = [
  {
    question: "Do I need to pay to try it?",
    answer:
      "No. The first lesson of the free track is fully open -- no card, no trial timer. You only subscribe when you want the locked challenges and the full Code Vault.",
  },
  {
    question: "What exactly is the Code Vault?",
    answer:
      "The downloadable assets behind each challenge: project scaffolds, config files, reference repos, and snippets. Paid challenges unlock their assets, and what you download is yours to reuse on real work.",
  },
  {
    question: "What is a validation lab?",
    answer:
      "An environment attached to selected challenges that verifies your build actually behaves as expected -- not just that it compiles. Challenges with an active lab are marked in the catalog.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Your subscription runs until the end of the current billing period, and you keep everything you have already downloaded.",
  },
  {
    question: "Is this for beginners?",
    answer:
      "Challenges are labelled beginner, intermediate, or advanced, and you can filter the catalog by level. It assumes you can already write code -- the focus is on building real systems, not on first-time programming.",
  },
] as const;

/**
 * FAQ built on native <details>/<summary>. This is deliberate: it is fully
 * accessible and keyboard-operable with ZERO client JavaScript, so the homepage
 * stays entirely server-rendered (item 108) instead of shipping an interactive
 * accordion bundle.
 */
export function FAQ() {
  return (
    <Section>
      <Container size="narrow">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Questions
        </h2>

        <div className="divide-y divide-border rounded-xl border border-border bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-foreground transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
