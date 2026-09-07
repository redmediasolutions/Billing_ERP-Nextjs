"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSubscriptionEntitlement } from "../hooks/use-subscription";
import { nagCopy } from "../lib/entitlement";

export function SubscriptionBanner() {
  const pathname = usePathname();
  const { entitlement, isLoading } = useSubscriptionEntitlement();

  if (isLoading || !entitlement.showBanner) return null;
  if (pathname.startsWith("/dashboard/subscription")) return null;

  const copy = nagCopy(entitlement);
  const urgent =
    entitlement.status === "locked" || entitlement.status === "grace";

  return (
    <div
      className={`flex flex-col gap-3 border-b px-6 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8 xl:px-10 ${
        urgent
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
      }`}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-sm font-medium">{copy.title}. {copy.description}</p>
      </div>
      <Button
        size="sm"
        variant={urgent ? "destructive" : "default"}
        className="shrink-0"
        asChild
      >
        <Link href="/dashboard/subscription">{copy.cta}</Link>
      </Button>
    </div>
  );
}
