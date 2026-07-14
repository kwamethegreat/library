import { Layers, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CourseFormat } from "@/types/content";

interface FormatBadgeProps {
  format: CourseFormat | null;
  className?: string;
}

/**
 * Editorial INTENT, not length:
 *   sprint      -> ship one thing, fast
 *   masterclass -> master a domain
 *
 * The description doubles as the accessible hint, since "Sprint" alone doesn't
 * tell a first-time visitor what they're committing to.
 */
const formatConfig: Record<
  CourseFormat,
  { label: string; hint: string; icon: LucideIcon; className: string }
> = {
  sprint: {
    label: "Sprint",
    hint: "Ship one thing, fast",
    icon: Zap,
    className: "border-accent text-accent",
  },
  masterclass: {
    label: "Masterclass",
    hint: "Master a domain",
    icon: Layers,
    className: "border-border text-foreground",
  },
};

/** Renders nothing when a course has no format set (the column is nullable). */
export function FormatBadge({ format, className }: FormatBadgeProps) {
  if (!format) {
    return null;
  }

  const config = formatConfig[format];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1", config.className, className)}
      title={config.hint}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
      <span className="sr-only">: {config.hint}</span>
    </Badge>
  );
}
