import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { PlatformAdminGuard } from "@/components/layout/platform-admin-guard";
import { PlatformLicencesDashboard } from "@/features/subscription/components/platform-licences-dashboard";

export default function PlatformLicencesPage() {
  return (
    <PlatformAdminGuard>
      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading licences...
          </div>
        }
      >
        <PlatformLicencesDashboard />
      </Suspense>
    </PlatformAdminGuard>
  );
}
