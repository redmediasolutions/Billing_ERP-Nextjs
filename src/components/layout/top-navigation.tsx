"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  ReceiptText,
  Users,
  Package,
  Warehouse,
  Tags,
  Truck,
  UserCog,
  Wallet,
  FileText,
  Search,
  Store,
} from "lucide-react";

import {
  moduleMenus,
  getCurrentModule,
} from "./navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileMenu } from "@/components/profile-menu";

const modules = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "POS Billing",
    href: "/dashboard/pos",
    icon: Store,
  },
  {
    label: "Invoices",
    href: "/dashboard/invoices",
    icon: ReceiptText,
  },
  {
    label: "Estimates",
    href: "/dashboard/estimates",
    icon: ClipboardList,
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    label: "Items",
    href: "/dashboard/items",
    icon: Package,
  },
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
    icon: UserCog,
  },
  {
    label: "Payroll",
    href: "/dashboard/payroll",
    icon: Wallet,
  },
  {
    label: "Reports",
    href: "/dashboard/pos/reports",
    icon: FileText,
  },
];

export function TopNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentModule = getCurrentModule(pathname);
  const topMenu = moduleMenus[currentModule] ?? [];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8 xl:px-10">

        {/* Left */}

        <div className="flex items-center gap-10">

          <div className="relative">

            <Button
              variant="ghost"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2"
            >
              <span className="text-xl">🏢</span>

              <span className="font-semibold">
                Billing ERP
              </span>

              <ChevronDown size={18} />
            </Button>

            {open && (
              <div className="absolute mt-3 w-80 rounded-2xl border border-border bg-popover p-4 shadow-xl">

                <div className="relative mb-4">

                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <Input
                    placeholder="Search modules..."
                    className="pl-10"
                  />

                </div>

                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Modules
                </p>

                <div className="space-y-1">
                  {modules.map((item) => {
                    const Icon = item.icon;

                    const active =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href ||
                          pathname.startsWith(item.href + "/");

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

              </div>
            )}

          </div>

          {/* Dynamic Top Navigation */}

          <nav className="hidden items-center gap-8 lg:flex">
            {topMenu.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Right */}

        <div className="flex items-center gap-3">

          <div className="relative hidden md:block">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              placeholder="Search..."
              className="w-64 pl-10"
            />

          </div>

          <ThemeToggle />

          <ProfileMenu />

        </div>

      </div>
    </header>
  );
}