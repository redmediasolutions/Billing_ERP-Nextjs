"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Search,
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
} from "lucide-react";

const modules = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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
    href: "/dashboard/reports",
    icon: FileText,
  },
];

export function TopNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-10">
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-neutral-100"
            >
              <span className="text-xl">🏢</span>

              <span className="font-semibold">
                Billing ERP
              </span>

              <ChevronDown size={18} />
            </button>

            {open && (
              <div className="absolute mt-3 w-80 rounded-2xl border bg-white p-4 shadow-xl">
                <div className="relative mb-4">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-neutral-400"
                  />

                  <input
                    placeholder="Search modules..."
                    className="w-full rounded-xl border py-2 pl-10 pr-3 outline-none"
                  />
                </div>

                <p className="mb-3 text-xs font-semibold uppercase text-neutral-400">
                  Modules
                </p>

                <div className="space-y-1">
                  {modules.map((item) => {
                    const Icon = item.icon;

                    const active =
                      pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 transition
                          ${
                            active
                              ? "bg-neutral-100 font-medium"
                              : "hover:bg-neutral-100"
                          }`}
                      >
                        <Icon size={18} />

                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            <Link href="/dashboard">Overview</Link>

            <Link href="/dashboard/reports">
              Analytics
            </Link>

            <Link href="/dashboard/activity">
              Activity
            </Link>

            <Link href="/dashboard/calendar">
              Calendar
            </Link>

            <Link href="/dashboard/reports">
              Reports
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-neutral-400"
            />

            <input
              placeholder="Search..."
              className="w-64 rounded-xl border py-2 pl-10 pr-3 outline-none"
            />
          </div>

          <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold">
            J
          </div>
        </div>
      </div>
    </header>
  );
}