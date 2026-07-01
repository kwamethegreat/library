import { Container } from "@/components/layout/Container";
import { requireUser } from "@/lib/auth";

import { LaneSelector } from "./LaneSelector";

export const metadata = {
  title: "Welcome",
};

export default async function OnboardingPage() {
  // Onboarding requires an authenticated user.
  await requireUser("/onboarding");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Container className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome! Let&apos;s personalize your experience.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Which best describes you? You can change this later.
          </p>
        </div>

        <LaneSelector />
      </Container>
    </div>
  );
}
