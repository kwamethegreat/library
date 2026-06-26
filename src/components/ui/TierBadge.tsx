import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserTier } from "@/types";

interface TierBadgeProps {
  tier: UserTier;
  className?: string;
}

const tierConfig: Record<UserTier, { label: string; className: string }> = {
  visitor: {
    label: "Visitor",
    className: "border-border bg-muted text-muted-foreground",
  },
  free: {
    label: "Free",
    className: "border-border bg-surface text-foreground",
  },
  paid: {
    label: "Paid",
    className: "border-transparent bg-accent text-accent-foreground",
  },
  enterprise: {
    label: "Enterprise",
    className: "border-transparent bg-success text-background",
  },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
