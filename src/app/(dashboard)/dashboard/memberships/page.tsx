import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { MembershipsDashboard } from "@/features/memberships/components/memberships-dashboard";

export default function MembershipsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading memberships...
        </div>
      }
    >
      <MembershipsDashboard />
    </Suspense>
  );
}
