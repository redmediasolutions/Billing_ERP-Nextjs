import { ReactNode, Suspense } from "react";
import { TopNavigation } from "./top-navigation";
import { PosOnlyGuard } from "./pos-only-guard";
import { SubscriptionBanner } from "@/features/subscription/components/subscription-banner";
import { SubscriptionLockScreen } from "@/features/subscription/components/subscription-lock-screen";
import { SubscriptionNagDialog } from "@/features/subscription/components/subscription-nag-dialog";

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
      <SubscriptionBanner />
      <SubscriptionNagDialog />
      <SubscriptionLockScreen />

      <main className="w-full px-6 py-8 text-left lg:px-8 xl:px-10">
        {children}
      </main>
    </div>
  );
}