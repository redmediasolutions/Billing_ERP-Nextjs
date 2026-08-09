"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { TopNavigation } from "./top-navigation";
import styles from "./dashboard-layout.module.css";

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
      <div className={styles.loading}>
        <Loader2 size={26} className={styles.spin} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.shell}>
      <TopNavigation />

      <main className={styles.main}>{children}</main>
    </div>
  );
}