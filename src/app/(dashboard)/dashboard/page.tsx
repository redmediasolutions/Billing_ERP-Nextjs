"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Package,
  ReceiptText,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const cards = [
  {
    title: "Manage Items",
    description: "Create and manage your products and services.",
    href: "/dashboard/items",
    icon: Package,
  },
  {
    title: "Invoices",
    description: "Create invoices and track payment status.",
    href: "/dashboard/invoices",
    icon: ReceiptText,
  },
  {
    title: "Customers",
    description: "Manage customer contacts and billing details.",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Estimates",
    description: "Prepare and send professional estimates.",
    href: "/dashboard/estimates",
    icon: FileText,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Overview
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Welcome to Billing ERP
        </h1>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Choose a module to start managing your business.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.href} href={card.href}>
              <Card className="group h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h2 className="mt-6 text-lg font-semibold">
                    {card.title}
                  </h2>

                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {card.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 font-medium">
                    Open Module

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}