import { cn } from "@/lib/utils";

interface SectionProps extends React.ComponentProps<"section"> {
  /** Vertical padding scale. Defaults to standard section spacing. */
  spacing?: "default" | "compact" | "spacious";
}

const spacingClasses: Record<NonNullable<SectionProps["spacing"]>, string> = {
  compact: "py-8 md:py-12",
  default: "py-12 md:py-16",
  spacious: "py-16 md:py-24",
};

export function Section({
  spacing = "default",
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn(spacingClasses[spacing], className)} {...props} />
  );
}