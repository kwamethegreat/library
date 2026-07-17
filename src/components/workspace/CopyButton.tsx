"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

interface CopyButtonProps {
  /** The text to copy. */
  value: string;
  /** Accessible label; defaults to "Copy". */
  label?: string;
  className?: string;
}

/**
 * The ONLY client component in the right pane. Copies `value` to the clipboard
 * and shows a brief "copied" state. Isolated deliberately: keeping the
 * interactivity in this small leaf means the pane, code block, and terminal
 * stay Server Components and the code content never ships as client JS beyond
 * the string this button needs.
 */
export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    // navigator.clipboard requires a secure context (https or localhost).
    void navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Silently ignore -- a failed copy shouldn't throw in the UI.
      });
  }, [value]);

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
