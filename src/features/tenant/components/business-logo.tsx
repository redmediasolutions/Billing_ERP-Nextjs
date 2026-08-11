"use client";

import type { Tenant } from "../types";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

export function BusinessLogo({
  tenant,
  size = "md",
}: {
  tenant?: Tenant;
  size?: "sm" | "md" | "lg";
}) {
  const name = tenant?.business_name || "Billing ERP";

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  const className = cn(
    "shrink-0 overflow-hidden rounded-lg object-cover",
    sizeMap[size]
  );

  if (tenant?.business_logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={tenant.business_logo}
        alt={`${name} logo`}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        className,
        "flex items-center justify-center bg-zinc-100 font-bold text-zinc-700"
      )}
    >
      {initials}
    </div>
  );
}
