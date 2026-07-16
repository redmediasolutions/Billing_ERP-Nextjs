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
  PanelLeftClose,
  PanelLeft,
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
  
  // States to handle layout and interactions
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const { data: tenant } = useTenant();

  // Combine logic to determine if sidebar should show full content
  const isSidebarExpanded = mobileOpen || isPinned || isHovered;

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
      {/* Mobile Menu Trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-zinc-700 bg-[#1e1e24] p-2 text-zinc-200 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Desktop Layout Spacer: Pushes main content ONLY when pinned */}
      <div
        className={`hidden shrink-0 transition-all duration-300 ease-in-out lg:block ${
          isPinned ? "w-[290px]" : "w-[80px]"
        }`}
      />

      {/* Sidebar Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-800 bg-[#171719] transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isSidebarExpanded ? "w-[290px]" : "w-[80px]"}
        `}
      >
        {/* Header / Logo Area */}
        <div
          className={`flex items-center border-b border-zinc-800 py-6 transition-all duration-300 ${
            isSidebarExpanded ? "justify-between px-6" : "justify-center px-0"
          }`}
        >
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="shrink-0">
              <BusinessLogo tenant={tenant} size="md" />
            </div>

            <div
              className={`flex min-w-0 flex-col justify-center overflow-hidden transition-all duration-300 ${
                isSidebarExpanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <p className="truncate whitespace-nowrap text-base font-bold text-white">
                {tenant?.business_name || "Billing ERP"}
              </p>
              <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                {tenant?.subscription_plan || "Enterprise Suite"}
              </p>
            </div>
          </Link>

          {/* Close button for Mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Pin/Unpin button for Desktop */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`hidden shrink-0 rounded-lg p-1.5 text-zinc-400 transition-all duration-300 hover:bg-zinc-800 hover:text-white lg:flex ${
              isSidebarExpanded ? "block opacity-100" : "hidden opacity-0"
            }`}
            title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {isPinned ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  group relative flex items-center gap-4 rounded-lg px-3 py-3 text-sm font-semibold transition-all duration-200
                  ${
                    active
                      ? "bg-[#27272f] text-white"
                      : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                  }
                  ${isSidebarExpanded ? "mx-4" : "mx-3 justify-center"}
                `}
              >
                {/* Active Indicator Line */}
                {active && (
                  <div className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-[#FFCC00]" />
                )}

                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    active ? "text-[#FFCC00]" : "text-zinc-500"
                  }`}
                />
                
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    isSidebarExpanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-zinc-800 p-3">
          <button
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className={`
              flex w-full items-center gap-4 rounded-lg px-3 py-3 text-sm font-semibold text-zinc-400 transition-all duration-200 hover:bg-red-950/30 hover:text-red-400 disabled:opacity-50
              ${isSidebarExpanded ? "justify-start" : "justify-center"}
            `}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                isSidebarExpanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}