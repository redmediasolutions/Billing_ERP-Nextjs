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
        className="sidebar-trigger"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="sidebar-overlay"
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Desktop Layout Spacer: Pushes main content ONLY when pinned */}
      <div
        className={`sidebar-spacer ${isPinned ? "sidebar-spacer--open" : ""}`}
      />

      {/* Sidebar Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`sidebar ${isSidebarExpanded ? "sidebar--open" : ""}`}
      >
        {/* Header / Logo Area */}
        <div
          className="sidebar__header"
        >
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="sidebar__brand"
          >
            <div>
              <BusinessLogo tenant={tenant} size="md" />
            </div>

            <div
              className="sidebar__brand-copy"
            >
              <p className="sidebar__brand-name">
                {tenant?.business_name || "Billing ERP"}
              </p>
              <p className="sidebar__plan">
                {tenant?.subscription_plan || "Enterprise Suite"}
              </p>
            </div>
          </Link>

          {/* Close button for Mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="sidebar__icon-button"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Pin/Unpin button for Desktop */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className="sidebar__icon-button sidebar__desktop-control"
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
        <nav className="sidebar__nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar__link ${active ? "sidebar__link--active" : ""}`}
              >
                {/* Active Indicator Line */}
                {active && (
                  <div className="sidebar__active-line" />
                )}

                <Icon
                  className="h-5 w-5 shrink-0"
                />
                
                <span
                  className="sidebar__label"
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="sidebar__footer">
          <button
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="sidebar__logout"
          >
            <LogOut className="h-5 w-5" />
            
            <span
              className="sidebar__label"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
