"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { useAuth } from "@/hooks/use-auth";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__content">
          <Loader2 className="dashboard-loading__icon" />
          <p className="dashboard-loading__text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">
      <DashboardSidebar />

      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
