"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { signInWithOAuthAction, type OAuthProvider } from "@/lib/auth/oauth";

/**
 * OAuth sign-in buttons. Rendered only when OAuth is enabled (the parent checks
 * the feature flag). Each button starts the provider flow via the server action.
 * This is scaffolding: with the flag off (default), the buttons never render and
 * the action is a no-op, so nothing changes in the current auth experience.
 */
const PROVIDERS: { provider: OAuthProvider; label: string }[] = [
  { provider: "google", label: "Continue with Google" },
  { provider: "github", label: "Continue with GitHub" },
];

export function OAuthButtons() {
  const [isPending, startTransition] = useTransition();

  function handleClick(provider: OAuthProvider) {
    startTransition(async () => {
      await signInWithOAuthAction(provider);
    });
  }

  return (
    <div className="space-y-2">
      <div className="relative py-2 text-center">
        <span className="bg-surface px-2 text-xs text-muted-foreground">
          or
        </span>
      </div>
      {PROVIDERS.map(({ provider, label }) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          className="w-full"
          disabled={isPending}
          onClick={() => handleClick(provider)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
