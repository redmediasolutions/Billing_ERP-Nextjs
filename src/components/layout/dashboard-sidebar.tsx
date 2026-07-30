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
  PanelLeft,
  PanelLeftClose,
  ReceiptText,
  Tags,
  Truck,
  Users,
  WalletCards,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";

import { auth } from "@/firebase/config";
import { BusinessLogo } from "@/features/tenant/components/business-logo";
import { useTenant } from "@/features/tenant/hooks/use-tenant";

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

  // Inventory catalogue modules
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    label: "Stocks",
    href: "/dashboard/stocks",
    icon: Warehouse,
  },
  {
    label: "Brands",
    href: "/dashboard/brands",
    icon: Tags,
  },
  {
    label: "Vendors",
    href: "/dashboard/vendors",
    icon: Truck,
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
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: tenant } = useTenant();

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
      <button
        onClick={() => setMobileOpen(true)}
        className="sidebar-trigger"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen ? (
        <button
          onClick={() => setMobileOpen(false)}
          className="sidebar-overlay"
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <div
        className={`sidebar-spacer ${
          isPinned ? "sidebar-spacer--open" : ""
        }`}
      />

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`sidebar ${
          isSidebarExpanded ? "sidebar--open" : ""
        }`}
      >
        <div className="sidebar__header">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="sidebar__brand"
          >
            <BusinessLogo tenant={tenant} size="md" />

            <div className="sidebar__brand-copy">
              <p className="sidebar__brand-name">
                {tenant?.business_name || "Billing ERP"}
              </p>

              <p className="sidebar__plan">
                {tenant?.subscription_plan || "Enterprise Suite"}
              </p>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="sidebar__icon-button sidebar__mobile-close"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={() =>
              setIsPinned((previous) => {
                const next = !previous;

                if (!next) {
                  setIsHovered(false);
                }

                return next;
              })
            }
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

        <nav className="sidebar__nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar__link ${
                  active ? "sidebar__link--active" : ""
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="sidebar__label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <button
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="sidebar__logout"
          >
            <LogOut className="h-5 w-5" />

            <span className="sidebar__label">
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}