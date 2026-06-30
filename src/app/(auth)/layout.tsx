import Link from "next/link";

import { Container } from "@/components/layout/Container";

/**
 * Layout for the (auth) route group: /login, /signup, /reset-password, etc.
 * Centered, dark, minimal -- no global nav/footer, just a focused card so the
 * user's attention stays on the form. The root layout already forces dark mode.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Container className="w-full max-w-sm">
        {/* Brand mark, linking home. */}
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            {/* Replace with your product name / logo. */}
            YourApp
          </Link>
        </div>

        {/* The auth card: each page renders its form inside this. */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {children}
        </div>

        {/* Subtle footer line under the card. */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} YourApp. All rights reserved.
        </p>
      </Container>
    </div>
  );
}