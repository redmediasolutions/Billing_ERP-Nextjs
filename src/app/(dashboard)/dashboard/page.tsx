import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Package,
  ReceiptText,
  Users,
} from "lucide-react";

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
    <section className="dashboard-page">
      <p className="dashboard-eyebrow">
        Overview
      </p>

      <h1 className="dashboard-title">Welcome to Billing ERP</h1>

      <p className="dashboard-intro">
        Choose a module to start managing your business.
      </p>

      <div className="dashboard-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.href}
              href={card.href}
              className="dashboard-module"
            >
              <Icon className="dashboard-module__icon" />

              <h2>{card.title}</h2>

              <p>
                {card.description}
              </p>

              <span className="dashboard-module__action">
                Open module
                <ArrowRight />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
