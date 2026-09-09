"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { usePlatformAdmin } from "@/hooks/use-platform-admin";

export function PlatformAdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, isPlatformAdmin } = usePlatformAdmin();

  useEffect(() => {
    if (!ready) return;
    if (!isPlatformAdmin) router.replace("/dashboard");
  }, [ready, isPlatformAdmin, router]);

  if (!ready) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Checking access...
      </div>
    );
  }

  if (!isPlatformAdmin) return null;

  return <>{children}</>;
}
