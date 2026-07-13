"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

// Wraps every page inside app/(dashboard)/. This is the single place that
// decides "is this person allowed to see any dashboard page at all" -
// individual pages don't need to repeat this check themselves.
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    // Wait until useAuth has actually finished checking before deciding to
    // redirect - otherwise we'd redirect everyone for a split second on
    // every page load, even people who ARE logged in.
    if (loading) return;

    if (!user || !isAdmin) {
      router.replace("/login");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking your session...
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Redirect above is already in flight - render nothing while it happens
    // so we don't flash real dashboard content to an unauthorized visitor.
    return null;
  }

  return <>{children}</>;
}
