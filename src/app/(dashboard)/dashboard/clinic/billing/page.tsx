import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { ClinicGuard } from "@/features/clinic/components/clinic-guard";
import { ClinicBillForm } from "@/features/clinic/components/clinic-bill-form";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading bill...
        </div>
      }
    >
      <ClinicGuard>
        <ClinicBillForm />
      </ClinicGuard>
    </Suspense>
  );
}
