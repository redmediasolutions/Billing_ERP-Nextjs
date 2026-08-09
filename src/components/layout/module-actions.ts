import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Package,
  Plus,
  ReceiptText,
  Tags,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";

export type ModuleAction = {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary";
  icon?: LucideIcon;
};

export type AppModule = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  actions: ModuleAction[];
};

export const APP_MODULES: AppModule[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: BarChart3,
    exact: true,
    actions: [
      {
        label: "New Bill",
        href: "/dashboard/pos",
        variant: "default",
        icon: ReceiptText,
      },
      {
        label: "New Invoice",
        href: "/dashboard/invoices/new",
        variant: "outline",
        icon: FileText,
      },
    ],
  },
  {
    label: "POS Billing",
    href: "/dashboard/pos",
    icon: ReceiptText,
    actions: [
      {
        label: "New Bill",
        href: "/dashboard/pos",
        variant: "default",
        icon: ReceiptText,
      },
      {
        label: "POS Items",
        href: "/dashboard/pos/items",
        variant: "outline",
        icon: Package,
      },
      {
        label: "POS Invoices",
        href: "/dashboard/pos/invoices",
        variant: "outline",
        icon: FileText,
      },
      {
        label: "Reports",
        href: "/dashboard/pos/reports",
        variant: "outline",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Estimates",
    href: "/dashboard/estimates",
    icon: ClipboardList,
    actions: [
      {
        label: "New Estimate",
        href: "/dashboard/estimates/new",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View All",
        href: "/dashboard/estimates",
        variant: "outline",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
    actions: [
      {
        label: "New Invoice",
        href: "/dashboard/invoices/new",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View All",
        href: "/dashboard/invoices",
        variant: "outline",
        icon: FileText,
      },
    ],
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    actions: [
      {
        label: "Add Customer",
        href: "/dashboard/customers?create=1",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View All",
        href: "/dashboard/customers",
        variant: "outline",
        icon: Users,
      },
    ],
  },
  {
    label: "Items",
    href: "/dashboard/items",
    icon: Package,
    actions: [
      {
        label: "Add Item",
        href: "/dashboard/items?create=1",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View All",
        href: "/dashboard/items",
        variant: "outline",
        icon: Package,
      },
    ],
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Package,
    actions: [
      {
        label: "Add Product",
        href: "/dashboard/products?create=1",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View All",
        href: "/dashboard/products",
        variant: "outline",
        icon: Package,
      },
    ],
  },
  {
    label: "Stocks",
    href: "/dashboard/stocks",
    icon: Warehouse,
    actions: [
      {
        label: "Add Stock",
        href: "/dashboard/stocks?create=1",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View All",
        href: "/dashboard/stocks",
        variant: "outline",
        icon: Warehouse,
      },
    ],
  },
  {
    label: "Brands",
    href: "/dashboard/brands",
    icon: Tags,
    actions: [
      {
        label: "Add Brand",
        href: "/dashboard/brands?create=1",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View All",
        href: "/dashboard/brands",
        variant: "outline",
        icon: Tags,
      },
    ],
  },
  {
    label: "Vendors",
    href: "/dashboard/vendors",
    icon: Truck,
    actions: [
      {
        label: "Add Vendor",
        href: "/dashboard/vendors?create=1",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View All",
        href: "/dashboard/vendors",
        variant: "outline",
        icon: Truck,
      },
    ],
  },
  {
    label: "Employees",
    href: "/dashboard/employees",
    icon: UserCog,
    actions: [
      {
        label: "Add Employee",
        href: "/dashboard/employees?create=1",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View All",
        href: "/dashboard/employees",
        variant: "outline",
        icon: UserCog,
      },
    ],
  },
  {
    label: "Payroll & Loans",
    href: "/dashboard/payroll",
    icon: Wallet,
    actions: [
      {
        label: "Add Loan",
        href: "/dashboard/payroll?create=loan",
        variant: "default",
        icon: Plus,
      },
      {
        label: "View Payroll",
        href: "/dashboard/payroll",
        variant: "outline",
        icon: Wallet,
      },
    ],
  },
];

const MODULE_MATCHERS = APP_MODULES.filter(
  (module) => module.href !== "/dashboard"
).sort((a, b) => b.href.length - a.href.length);

export function resolveActiveModule(pathname: string): AppModule {
  if (pathname === "/dashboard") {
    return APP_MODULES[0];
  }

  const matched = MODULE_MATCHERS.find(
    (module) =>
      pathname === module.href || pathname.startsWith(`${module.href}/`)
  );

  return matched ?? APP_MODULES[0];
}

export const MODULE_NAV_LINKS = [
  { label: "Overview", href: "/dashboard" },
  { label: "POS", href: "/dashboard/pos" },
  { label: "Invoices", href: "/dashboard/invoices" },
  { label: "Customers", href: "/dashboard/customers" },
  { label: "Reports", href: "/dashboard/pos/reports" },
];
