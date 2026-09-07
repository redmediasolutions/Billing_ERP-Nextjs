"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTenant } from "@/features/tenant/hooks/use-tenant";

import { useSubscriptionEntitlement } from "../hooks/use-subscription";
import { nagCopy } from "../lib/entitlement";
import {
  dismissNagToday,
  nagFingerprint,
  wasNagDismissedToday,
} from "../lib/nag";

export function SubscriptionNagDialog() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: tenant } = useTenant();
  const { entitlement, isLoading } = useSubscriptionEntitlement();
  const [open, setOpen] = useState(false);

  const fingerprint = useMemo(
    () =>
      nagFingerprint({
        status: entitlement.status,
        daysRemaining: entitlement.daysRemaining,
        daysUntilLock: entitlement.daysUntilLock,
      }),
    [
      entitlement.daysRemaining,
      entitlement.daysUntilLock,
      entitlement.status,
    ]
  );

  const copy = nagCopy(entitlement);
  const onBillingPage = pathname.startsWith("/dashboard/subscription");
  const locked = entitlement.isBlocking;

  useEffect(() => {
  if (isLoading || onBillingPage || locked) {
      setOpen(false);
      return;
    }
    if (!entitlement.showNag) {
      setOpen(false);
      return;
    }
    if (wasNagDismissedToday(tenant?.id, fingerprint)) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [
    entitlement.showNag,
    fingerprint,
    isLoading,
    locked,
    onBillingPage,
    tenant?.id,
  ]);

  function acknowledge() {
    dismissNagToday(tenant?.id, fingerprint);
    setOpen(false);
  }

  function payNow() {
    dismissNagToday(tenant?.id, fingerprint);
    setOpen(false);
    router.push("/dashboard/subscription");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) acknowledge();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={acknowledge}>
            Remind me tomorrow
          </Button>
          <Button type="button" onClick={payNow}>
            {copy.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
