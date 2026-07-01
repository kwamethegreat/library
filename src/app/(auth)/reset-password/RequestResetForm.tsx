"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordResetRequestSchema } from "@/lib/validation/auth";

import { requestPasswordResetAction } from "./actions";

export function RequestResetForm() {
  const [isPending, startTransition] = useTransition();
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    const formData = new FormData(event.currentTarget);
    const raw = { email: formData.get("email") };

    const parsed = passwordResetRequestSchema.safeParse(raw);
    if (!parsed.success) {
      setFieldError(
        parsed.error.issues[0]?.message ?? "Enter a valid email address.",
      );
      return;
    }

    startTransition(async () => {
      await requestPasswordResetAction(parsed.data);
      // Always show the same confirmation, regardless of whether the email
      // exists (anti-enumeration).
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="text-sm text-foreground">
          If an account exists for that email, we&apos;ve sent a password reset
          link.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Check your inbox (and spam folder) for the link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
