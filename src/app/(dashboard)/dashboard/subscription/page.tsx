import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SubscriptionDashboard } from "@/features/subscription/components/subscription-dashboard";

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading subscription...
        </div>
      }
    >
      <SubscriptionDashboard />
    </Suspense>
  );
}
