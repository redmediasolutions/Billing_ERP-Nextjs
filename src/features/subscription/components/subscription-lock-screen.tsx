"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { company } from "@/lib/company";

import { useSubscriptionEntitlement } from "../hooks/use-subscription";
import { formatDateOnly, nagCopy } from "../lib/entitlement";

export function SubscriptionLockScreen() {
  const pathname = usePathname();
  const { entitlement, isLoading } = useSubscriptionEntitlement();

  if (isLoading) return null;
  if (!entitlement.isBlocking) return null;
  if (pathname.startsWith("/dashboard/subscription")) return null;

  const copy = nagCopy(entitlement);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/85 p-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl ring-1 ring-foreground/10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Lock className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Subscription locked
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">{copy.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {copy.description} Expired on{" "}
          {formatDateOnly(entitlement.expiresOn)}. Contact{" "}
          {company.email} if payment already went through.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/subscription">{copy.cta}</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={`mailto:${company.email}`}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Email billing
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
