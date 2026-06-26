import { TriangleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Optional retry handler — renders a retry button when provided. */
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-surface px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <TriangleAlertIcon
        className="size-10 text-destructive"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-accent hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}