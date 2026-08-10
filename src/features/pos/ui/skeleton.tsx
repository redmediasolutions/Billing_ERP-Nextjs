import { cn } from "@/features/pos/lib/utils";
import "./skeleton.css";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...props} />;
}
