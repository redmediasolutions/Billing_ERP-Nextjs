import { ReactNode } from "react";
import { TopNavigation } from "./top-navigation";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <TopNavigation />

      <main className="mx-auto max-w-7xl px-8 py-8">
        {children}
      </main>
    </div>
  );
}