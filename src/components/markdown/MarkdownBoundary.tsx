"use client";

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface MarkdownBoundaryProps {
  children: ReactNode;
  /** Shown when the wrapped markdown fails to render. */
  fallback?: ReactNode;
}

interface MarkdownBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary that isolates a markdown RENDER failure to the theory body
 * (item 123: "markdown render error").
 *
 * Why this exists: react-markdown is resilient to most bad input, but
 * pathological content -- e.g. extreme nesting -- can throw
 * "Maximum call stack size exceeded" DURING RENDER. Markdown renders inside a
 * Server Component; an uncaught throw there would bubble to the route's
 * error.tsx and blank the ENTIRE workspace (video, code pane, everything).
 *
 * React error boundaries must be class CLIENT components. This one wraps the
 * (server-rendered) Markdown subtree passed as `children`, so a failure degrades
 * only the theory body to a small fallback while the rest of the lesson page
 * stays intact. Errors in server children surface to the nearest client
 * boundary during render/hydration, which is this.
 */
export class MarkdownBoundary extends Component<
  MarkdownBoundaryProps,
  MarkdownBoundaryState
> {
  constructor(props: MarkdownBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): MarkdownBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log for observability; swap for Sentry in the error-monitoring phase.
    console.error("Markdown render failed:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            This lesson&apos;s content could not be displayed. Please try again
            later.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
