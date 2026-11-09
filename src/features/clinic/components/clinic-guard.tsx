"use client";

import { useState } from "react";
import { HeartPulse, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useIsClinicTenant, useUpdateClinicSettings } from "../hooks/use-clinic";
import { errorMessage } from "../lib/clinic-format";

/**
 * Clinic pages only make sense for a clinic tenant. Other ERP tenants
 * that open a clinic URL see a short explanation instead (and an admin
 * can switch the Clinic modules on for their business).
 */
export function ClinicGuard({ children }: { children: React.ReactNode }) {
  const { isClinic, isLoading } = useIsClinicTenant();
  const enable = useUpdateClinicSettings();
  const [error, setError] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  if (isClinic) return <>{children}</>;

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="space-y-4 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HeartPulse className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">Clinic modules are off</h1>
          <p className="text-sm text-muted-foreground">
            Patients, appointments, consultations, medicines and clinic billing
            are available for clinics and pharmacies. Turning them on adds a
            Clinic section to the menu; your existing data is not changed.
          </p>
        </div>
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        <Button
          disabled={enable.isPending}
          onClick={async () => {
            try {
              setError("");
              await enable.mutateAsync({ clinic_enabled: true });
            } catch (err) {
              setError(errorMessage(err, "Unable to turn on clinic modules."));
            }
          }}
        >
          {enable.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Turn on clinic modules
        </Button>
      </CardContent>
    </Card>
  );
}
