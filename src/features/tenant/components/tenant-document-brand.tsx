"use client";

import { Building2 } from "lucide-react";
import { useTenant } from "../hooks/use-tenant";
import { BusinessLogo } from "./business-logo";

export function TenantDocumentBrand() {
  const { data: tenant } = useTenant();

  const businessName = tenant?.business_name || "Billing ERP";

  return (
    <div>
      <div className="flex items-center gap-3">
        {tenant ? (
          <BusinessLogo tenant={tenant} size="lg" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFCC00] text-black">
            <Building2 className="h-7 w-7" />
          </div>
        )}

        <h1 className="text-3xl font-black tracking-tight text-black">
          {businessName}
        </h1>
      </div>

      <div className="mt-5 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-600">
        {tenant?.business_address && (
          <p>{tenant.business_address}</p>
        )}

        {tenant?.business_email && (
          <p>{tenant.business_email}</p>
        )}

        {(tenant?.business_phone || tenant?.business_mobile) && (
          <p>
            {tenant.business_phone || tenant.business_mobile}
          </p>
        )}

        {tenant?.business_gst && (
          <p>GSTIN: {tenant.business_gst}</p>
        )}
      </div>
    </div>
  );
}