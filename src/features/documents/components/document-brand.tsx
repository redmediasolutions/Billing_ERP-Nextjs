"use client";

import { Building2 } from "lucide-react";

import { BusinessLogo } from "@/features/tenant/components/business-logo";
import { useTenant } from "@/features/tenant/hooks/use-tenant";

export function DocumentBrand({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { data: tenant } = useTenant();
  const businessName = tenant?.business_name || "Billing ERP";

  if (compact) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-2 flex justify-center">
          {tenant ? (
            <BusinessLogo tenant={tenant} size="md" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
              <Building2 className="h-5 w-5" />
            </div>
          )}
        </div>
        <p className="text-sm font-bold tracking-wide text-zinc-950">
          {businessName}
        </p>
        {tenant?.business_address && (
          <p className="mt-1 text-[11px] leading-snug text-zinc-600">
            {tenant.business_address}
          </p>
        )}
        {(tenant?.business_phone || tenant?.business_mobile) && (
          <p className="text-[11px] text-zinc-600">
            {tenant.business_phone || tenant.business_mobile}
          </p>
        )}
        {tenant?.business_gst && (
          <p className="text-[11px] text-zinc-600">
            GSTIN: {tenant.business_gst}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex items-start gap-3">
        {tenant ? (
          <BusinessLogo tenant={tenant} size="lg" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
            <Building2 className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            {businessName}
          </h1>
          <div className="mt-1 space-y-0.5 text-xs leading-relaxed text-zinc-600">
            {tenant?.business_address && <p>{tenant.business_address}</p>}
            {tenant?.business_email && <p>{tenant.business_email}</p>}
            {(tenant?.business_phone || tenant?.business_mobile) && (
              <p>{tenant.business_phone || tenant.business_mobile}</p>
            )}
            {tenant?.business_gst && <p>GSTIN: {tenant.business_gst}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
