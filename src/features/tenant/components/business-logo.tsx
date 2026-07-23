"use client";

import type { Tenant } from "../types";

export function BusinessLogo({
  tenant,
  size = "md",
}: {
  tenant?: Tenant;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "business-logo--sm",
    md: "business-logo--md",
    lg: "business-logo--lg",
  }[size];

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
        className={`business-logo ${sizeClass}`}
      />
    );
  }

  return (
    <div className={`business-logo ${sizeClass}`}>
      {initials}
    </div>
  );
}