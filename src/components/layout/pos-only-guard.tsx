"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTenant } from "@/features/tenant/hooks/use-tenant";
import { isPosOnlyTenant } from "@/lib/pos-only-tenants";

export function PosOnlyGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: tenant } = useTenant();

  useEffect(() => {
    if (!isPosOnlyTenant(tenant?.id)) return;
    if (pathname.startsWith("/dashboard/pos")) return;
    router.replace("/dashboard/pos");
  }, [tenant?.id, pathname, router]);

  return null;
}
