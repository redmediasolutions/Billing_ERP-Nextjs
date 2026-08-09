"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Package,
  ReceiptText,
  Tags,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useTenant } from "@/features/tenant/hooks/use-tenant";
import styles from "./dashboard-home.module.css";

const primaryModules = [
  {
    title: "Manage Items",
    description: "Catalogue products, services, pricing, and inventory settings.",
    href: "/dashboard/items",
    icon: Package,
  },
  {
    title: "Invoices",
    description: "Create invoices, track drafts, and manage billing records.",
    href: "/dashboard/invoices",
    icon: ReceiptText,
  },
  {
    title: "Customers",
    description: "Store contacts, GST details, and billing addresses.",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Estimates",
    description: "Prepare quotes and convert them into invoices.",
    href: "/dashboard/estimates",
    icon: ClipboardList,
  },
];

const secondaryModules = [
  { title: "POS Billing", href: "/dashboard/pos", icon: ReceiptText },
  { title: "Products", href: "/dashboard/products", icon: Package },
  { title: "Stocks", href: "/dashboard/stocks", icon: Warehouse },
  { title: "Brands", href: "/dashboard/brands", icon: Tags },
  { title: "Vendors", href: "/dashboard/vendors", icon: Truck },
  { title: "Employees", href: "/dashboard/employees", icon: UserCog },
  { title: "Payroll", href: "/dashboard/payroll", icon: Wallet },
  { title: "Reports", href: "/dashboard/pos/reports", icon: FileText },
];

export default function DashboardPage() {
  const { data: tenant } = useTenant();
  const businessName = tenant?.business_name || "your business";

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Overview</p>
          <h1 className={styles.title}>
            Welcome back to Billing ERP
          </h1>
          <p className={styles.subtitle}>
            Run {businessName} from one premium workspace. Jump into sales,
            inventory, payroll, and reporting without leaving the dashboard.
          </p>
        </section>

        <section className={styles.stats}>
          {[
            { label: "Core Modules", value: "12" },
            { label: "Sales Suite", value: "4" },
            { label: "Inventory", value: "4" },
            { label: "People Ops", value: "2" },
          ].map((stat) => (
            <Card key={stat.label} className={styles.statCard}>
              <CardContent className={styles.statContent}>
                <p className={styles.statLabel}>{stat.label}</p>
                <p className={styles.statValue}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Core modules</h2>
              <p className={styles.sectionCopy}>
                Your most-used business workflows, designed for speed.
              </p>
            </div>
          </div>

          <div className={styles.grid}>
            {primaryModules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className={styles.moduleCard}
                >
                  <CardContent className={styles.moduleContent}>
                    <div className={styles.moduleIcon}>
                      <Icon size={22} />
                    </div>

                    <h3 className={styles.moduleTitle}>{module.title}</h3>

                    <p className={styles.moduleDescription}>
                      {module.description}
                    </p>

                    <div className={styles.moduleFooter}>
                      Open module
                      <ArrowRight size={16} />
                    </div>
                  </CardContent>
                </Link>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>More modules</h2>
              <p className={styles.sectionCopy}>
                POS, inventory, vendors, payroll, and reporting.
              </p>
            </div>
          </div>

          <div className={styles.secondaryGrid}>
            {secondaryModules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className={styles.secondaryCard}
                >
                  <div className={styles.secondaryIcon}>
                    <Icon size={17} />
                  </div>
                  <p className={styles.secondaryTitle}>{module.title}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
