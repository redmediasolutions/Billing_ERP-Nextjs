"use client";

import { Building2 } from "lucide-react";
import { useTenant } from "../hooks/use-tenant";
import { BusinessLogo } from "./business-logo";

export function TenantDocumentBrand() {
  const { data: tenant } = useTenant();

  const businessName = tenant?.business_name || "Billing ERP";

  return (
    <div>
      <div className="tenant-brand__row">
        {tenant ? (
          <BusinessLogo tenant={tenant} size="lg" />
        ) : (
          <div className="tenant-brand__placeholder">
            <Building2 className="h-7 w-7" />
          </div>
        )}

        <h1 className="tenant-brand__name">{businessName}</h1>
      </div>

      <div className="tenant-brand__details">
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