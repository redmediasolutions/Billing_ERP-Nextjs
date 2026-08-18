import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { ResourcesDashboard } from "@/features/bookings/components/resources-dashboard";

export default function BookingResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading resources...
        </div>
      }
    >
      <ResourcesDashboard />
    </Suspense>
  );
}
