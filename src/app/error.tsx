"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/ErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO (observability phase): report this to Sentry.
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <ErrorState onRetry={reset} className="w-full max-w-md" />
    </main>
  );
}
