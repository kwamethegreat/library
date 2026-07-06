import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const features = [
  {
    title: "Zazi is really awesome!",
    description: "Learn through guided, progressive course content.",
  },
  {
    title: "Hands-on Code",
    description: "Work with real code examples and a built-in code vault.",
  },
  {
    title: "Track Progress",
    description: "Pick up where you left off across every lesson.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Section spacing="spacious">
        <Container className="flex flex-col items-center gap-6 text-center">
          <Badge variant="outline" className="border-accent text-accent">
            Now in development
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Learn to build, one lesson at a time
          </h1>
          <p className="max-w-xl text-muted-foreground">
            A technical learning platform with structured courses, hands-on
            code, and progress tracking. {/* TODO: real copy */}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/catalog"
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              Browse courses
            </Link>
            <Link
              href="/pricing"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View pricing
            </Link>
          </div>
        </Container>
      </Section>

      {/* Feature cards */}
      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-surface">
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {/* TODO: feature detail or illustration */}
                  Coming soon.
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
