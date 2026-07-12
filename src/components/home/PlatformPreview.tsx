import { Boxes, PanelsTopLeft, TerminalSquare } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const capabilities = [
  {
    icon: PanelsTopLeft,
    title: "Split-view workspace",
    description: "Theory on the left, code on the right.",
    detail:
      "Watch and read alongside the editor, so you never lose your place switching between a video and your terminal.",
  },
  {
    icon: Boxes,
    title: "The Code Vault",
    description: "Production-grade assets you keep.",
    detail:
      "Scaffolds, configs, and reference repos -- downloadable, versioned, and yours to reuse on real work.",
  },
  {
    icon: TerminalSquare,
    title: "Validation labs",
    description: "Prove it runs, not just that it compiles.",
    detail:
      "Selected challenges ship with an active lab so you can verify your build against the expected behaviour.",
  },
] as const;

/**
 * What the platform actually gives you. Server component -- static content,
 * no client JS.
 */
export function PlatformPreview() {
  return (
    <Section>
      <Container>
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            A workspace, not a video library
          </h2>
          <p className="mt-2 text-muted-foreground">
            Every challenge is built to be executed, not just watched.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {capabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <Card key={capability.title} className="bg-surface">
                <CardHeader>
                  <Icon
                    className="mb-2 size-5 text-accent"
                    aria-hidden="true"
                  />
                  <CardTitle>{capability.title}</CardTitle>
                  <CardDescription>{capability.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {capability.detail}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
