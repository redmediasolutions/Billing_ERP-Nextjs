"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { auth } from "@/firebase/config";

import { useTenant } from "@/features/tenant/hooks/use-tenant";
import { BusinessLogo } from "@/features/tenant/components/business-logo";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Estimates",
    href: "/dashboard/estimates",
    icon: ClipboardList,
  },
  {
    label: "Invoices",
    href: "/dashboard/invoices",
    icon: ReceiptText,
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    label: "Manage Items",
    href: "/dashboard/items",
    icon: Package,
  },
  {
    label: "Employees",
    href: "/dashboard/employees",
    icon: BarChart3,
  },
  {
    label: "Payroll & Loans",
    href: "/dashboard/payroll",
    icon: WalletCards,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { data: tenant } = useTenant();

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await auth.signOut();

      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-zinc-700 bg-[#1e1e24] p-2 text-zinc-200 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col
          border-r border-zinc-800 bg-[#171719] transition-transform duration-200
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-6">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <BusinessLogo tenant={tenant} size="md" />

            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">
                {tenant?.business_name || "Billing ERP"}
              </p>

              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                {tenant?.subscription_plan || "Enterprise Suite"}
              </p>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-semibold transition
                  ${active
                    ? "border-l-4 border-[#FFCC00] bg-[#27272f] pl-3 text-white"
                    : "border-l-4 border-transparent text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 ${active ? "text-[#FFCC00]" : "text-zinc-500"
                    }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <button
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-sm font-semibold text-zinc-400 transition hover:bg-red-950/30 hover:text-red-400 disabled:opacity-50"
          >
            <LogOut className="h-5 w-5" />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}