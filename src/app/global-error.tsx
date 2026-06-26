"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        style={{ background: "#090d16", color: "#f1f5f9" }}
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p style={{ color: "#94a3b8" }}>
          A critical error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ border: "1px solid #242f41" }}
          className="mt-2 rounded-md px-4 py-2 text-sm font-medium"
        >
          Try again
        </button>
      </body>
    </html>
  );
}