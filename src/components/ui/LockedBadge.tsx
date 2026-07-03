import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AccessLevel } from "@/types/access";

interface LockedBadgeProps {
  accessLevel: AccessLevel;
  className?: string;
}

/**
 * Config for the LOCKED access levels only. "free" is intentionally absent --
 * free content isn't locked, so LockedBadge renders nothing for it.
 */
const lockedConfig: Partial<
  Record<AccessLevel, { label: string; className: string }>
> = {
  paid: {
    label: "Paid",
    className: "border-transparent bg-accent text-accent-foreground",
  },
  enterprise: {
    label: "Enterprise",
    className: "border-transparent bg-success text-background",
  },
};

/**
 * Shows a lock indicator on gated content (paid / enterprise). Renders nothing
 * for free content. The label communicates WHICH tier unlocks it, matching the
 * TierBadge visual language.
 */
export function LockedBadge({ accessLevel, className }: LockedBadgeProps) {
  const config = lockedConfig[accessLevel];
  if (!config) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn("gap-1", config.className, className)}
    >
      <Lock className="h-3 w-3" aria-hidden="true" />
      <span className="sr-only">Locked, requires </span>
      {config.label}
    </Badge>
  );
}
