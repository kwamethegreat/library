import { cn } from "@/lib/utils";

interface ContainerProps extends React.ComponentProps<"div"> {
  /** Max-width variant. Defaults to the standard 6xl content width. */
  size?: "default" | "narrow" | "wide" | "full";
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  narrow: "max-w-3xl", // prose, auth forms, focused reading
  default: "max-w-6xl", // standard page content
  wide: "max-w-7xl", // dashboards, wide layouts
  full: "max-w-none", // edge-to-edge
};

export function Container({
  size = "default",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4", sizeClasses[size], className)}
      {...props}
    />
  );
}