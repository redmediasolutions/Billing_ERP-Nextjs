"use client";

import type { Tenant } from "../types";

export function BusinessLogo({
  tenant,
  size = "md",
}: {
  tenant?: Tenant;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions = {
    sm: "h-9 w-9 text-sm",
    md: "h-11 w-11 text-base",
    lg: "h-14 w-14 text-xl",
  };

  const name = tenant?.business_name || "Billing ERP";

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  if (tenant?.business_logo) {
    return (
      <img
        src={tenant.business_logo}
        alt={`${name} logo`}
        className={`${dimensions[size]} rounded-xl object-contain`}
      />
    );
  }

  return (
    <div
      className={`flex ${dimensions[size]} shrink-0 items-center justify-center rounded-xl bg-[#FFCC00] font-black text-black`}
    >
      {initials}
    </div>
  );
}