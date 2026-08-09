"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  ReceiptText,
  Search,
  Tags,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";

import { useTenant } from "@/features/tenant/hooks/use-tenant";
import styles from "./top-navigation.module.css";

const modules = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "POS Billing",
    href: "/dashboard/pos",
    icon: ReceiptText,
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
    label: "Payroll & Loans",
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
  const { data: tenant } = useTenant();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const visibleModules = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return modules;

    return modules.filter((module) =>
      module.label.toLowerCase().includes(query)
    );
  }, [search]);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className={styles.topNavigation}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.moduleMenu}>
            <button
              type="button"
              className={styles.businessButton}
              onClick={() => setOpen((current) => !current)}
              aria-expanded={open}
            >
              <span className={styles.businessMark}>B</span>

              <span className={styles.businessName}>
                {tenant?.business_name || "Billing ERP"}
              </span>

              <ChevronDown
                size={17}
                className={open ? styles.chevronOpen : ""}
              />
            </button>

            {open ? (
              <div className={styles.dropdown}>
                <div className={styles.searchField}>
                  <Search size={17} />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search modules..."
                    autoFocus
                  />
                </div>

                <p className={styles.dropdownLabel}>Modules</p>

                <div className={styles.moduleList}>
                  {visibleModules.map((module) => {
                    const Icon = module.icon;

                    return (
                      <Link
                        key={module.href}
                        href={module.href}
                        onClick={() => {
                          setOpen(false);
                          setSearch("");
                        }}
                        className={`${styles.moduleLink} ${
                          isActive(module.href)
                            ? styles.moduleLinkActive
                            : ""
                        }`}
                      >
                        <Icon size={18} />
                        <span>{module.label}</span>
                      </Link>
                    );
                  })}

                  {visibleModules.length === 0 ? (
                    <p className={styles.noResults}>
                      No matching module.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <nav className={styles.quickLinks}>
            <Link href="/dashboard">Overview</Link>
            <Link href="/dashboard/pos">POS</Link>
            <Link href="/dashboard/invoices">Invoices</Link>
            <Link href="/dashboard/reports">Reports</Link>
          </nav>
        </div>

        <Link href="/dashboard/pos" className={styles.posShortcut}>
          <ReceiptText size={17} />
          New Bill
        </Link>
      </div>
    </header>
  );
}