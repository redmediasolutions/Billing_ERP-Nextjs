import { cn } from "@/features/pos/lib/utils";
import "./badge.css";

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "success" | "danger" | "warning" | "outline";
}) {
  return <span className={cn("badge", `badge-${variant}`, className)} {...props} />;
}
