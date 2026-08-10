import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PayrollDashboard } from "@/features/payroll/components/payroll-dashboard";

export default function PayrollPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading payroll...
        </div>
      }
    >
      <PayrollDashboard />
    </Suspense>
  );
}
