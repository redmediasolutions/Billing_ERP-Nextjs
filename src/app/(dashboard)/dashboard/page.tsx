"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Loader2,
  Package,
  ReceiptText,
  Store,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import { useInvoices } from "@/features/invoices/hooks/use-invoices";
import { useProducts } from "@/features/products/hooks/use-products";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const cards = [
  {
    title: "POS Billing",
    description:
      "Fast checkout, cart billing, and point-of-sale invoices.",
    href: "/dashboard/pos",
    icon: Store,
  },
  {
    title: "Manage Items",
    description:
      "Create and organize products and services used in invoices.",
    href: "/dashboard/items",
    icon: Package,
  },
  {
    title: "Invoices",
    description:
      "Create invoices, monitor payments and customer balances.",
    href: "/dashboard/invoices",
    icon: ReceiptText,
  },
  {
    title: "Customers",
    description:
      "Maintain customer information and billing addresses.",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Estimates",
    description:
      "Prepare professional quotations before invoicing.",
    href: "/dashboard/estimates",
    icon: FileText,
  },
];

export default function DashboardPage() {
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const finalizedInvoices = invoices.filter((invoice) => !invoice.is_draft);
  const revenue = finalizedInvoices.reduce(
    (sum, invoice) => sum + invoice.rounded_total,
    0
  );

  const statsLoading = invoicesLoading || customersLoading || productsLoading;

  const stats = [
    {
      title: "Revenue",
      value: statsLoading ? "—" : money.format(revenue),
      icon: DollarSign,
    },
    {
      title: "Invoices",
      value: statsLoading ? "—" : String(invoices.length),
      icon: ReceiptText,
    },
    {
      title: "Customers",
      value: statsLoading ? "—" : String(customers.length),
      icon: Users,
    },
    {
      title: "Products",
      value: statsLoading ? "—" : String(products.length),
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="w-full space-y-10 text-left">

      {/* Header */}

      <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:items-start lg:justify-between">

        <div className="w-full text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Dashboard
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Welcome back 👋
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Manage invoices, customers, inventory and accounting
            from one central dashboard.
          </p>
        </div>

        <Card className="w-full max-w-sm self-start">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-primary/10 p-3">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Business Status
              </p>

              <h3 className="text-lg font-semibold">
                {statsLoading ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : invoices.length > 0 ? (
                  `${finalizedInvoices.length} finalized invoice${finalizedInvoices.length === 1 ? "" : "s"}`
                ) : (
                  "Ready to start"
                )}
              </h3>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Stats */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.title}
              className="transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {stat.value}
                  </h2>
                </div>

                <div className="rounded-2xl bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modules */}

      <div>
        <h2 className="mb-6 text-2xl font-semibold">
          Modules
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.href} href={card.href}>
                <Card className="group h-full rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col p-7">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7" />
                    </div>

                    <h3 className="mt-7 text-xl font-semibold">
                      {card.title}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                      {card.description}
                    </p>

                    <div className="mt-8 flex items-center gap-2 font-medium text-primary">
                      Open Module

                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>

                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
