import { ReactNode } from "react";
import { TopNavigation } from "./top-navigation";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNavigation />

      <main className="w-full px-6 py-8 text-left lg:px-8 xl:px-10">
        {children}
      </main>
    </div>
  );
}