import { ReactNode, Suspense } from "react";
import { TopNavigation } from "./top-navigation";
import { PosOnlyGuard } from "./pos-only-guard";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={<div className="h-16 border-b border-border" />}>
        <TopNavigation />
      </Suspense>
      <PosOnlyGuard />

      <main className="w-full px-6 py-8 text-left lg:px-8 xl:px-10">
        {children}
      </main>
    </div>
  );
}