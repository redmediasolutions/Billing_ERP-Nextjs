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
    color: "text-[#FFCC00]",
  },
  {
    title: "Invoices",
    description: "Create invoices and track payment status.",
    href: "/dashboard/invoices",
    icon: ReceiptText,
    color: "text-emerald-400",
  },
  {
    title: "Customers",
    description: "Manage customer contacts and billing details.",
    href: "/dashboard/customers",
    icon: Users,
    color: "text-blue-400",
  },
  {
    title: "Estimates",
    description: "Prepare and send professional estimates.",
    href: "/dashboard/estimates",
    icon: FileText,
    color: "text-violet-400",
  },
];

export default function DashboardPage() {
  return (
    <section className="min-h-screen bg-[#111113] p-6 pt-20 text-white lg:p-8 lg:pt-8">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FFCC00]">
        Overview
      </p>

      <h1 className="mt-2 text-3xl font-bold">Welcome to Billing ERP</h1>

      <p className="mt-2 text-zinc-400">
        Choose a module to start managing your business.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-zinc-800 bg-[#1e1e24] p-5 transition hover:border-zinc-600 hover:bg-[#232329]"
            >
              <Icon className={`h-7 w-7 ${card.color}`} />

              <h2 className="mt-5 font-bold text-white">{card.title}</h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {card.description}
              </p>

              <span className="mt-5 flex items-center gap-2 text-sm font-bold text-[#FFCC00]">
                Open module
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}