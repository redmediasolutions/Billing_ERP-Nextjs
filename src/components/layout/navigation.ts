export const moduleMenus = {
  dashboard: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "POS Billing", href: "/dashboard/pos" },
    { label: "Invoices", href: "/dashboard/invoices" },
    { label: "Estimates", href: "/dashboard/estimates" },
    { label: "Customers", href: "/dashboard/customers" },
    { label: "Items", href: "/dashboard/items" },
    { label: "Inventory", href: "/dashboard/inventory" },
    { label: "Vendors", href: "/dashboard/vendors" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  pos: [
    { label: "Billing", href: "/dashboard/pos" },
    { label: "POS Items", href: "/dashboard/pos/items" },
    { label: "POS Invoices", href: "/dashboard/pos/invoices" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  inventory: [
    { label: "Overview", href: "/dashboard/inventory" },
    { label: "Products", href: "/dashboard/products" },
    { label: "Brands", href: "/dashboard/brands" },
    { label: "Serial Stock", href: "/dashboard/stocks" },
  ],

  items: [
    { label: "All Items", href: "/dashboard/items" },
    { label: "Add Item", href: "/dashboard/items?create=1" },
  ],

  vendors: [
    { label: "All Vendors", href: "/dashboard/vendors" },
  ],

  estimates: [
    { label: "All Estimates", href: "/dashboard/estimates" },
    { label: "New Estimate", href: "/dashboard/estimates/new" },
  ],

  invoices: [
    { label: "All Invoices", href: "/dashboard/invoices" },
    { label: "New Invoice", href: "/dashboard/invoices/new" },
    { label: "Drafts", href: "/dashboard/invoices?status=draft" },
    { label: "Finalized", href: "/dashboard/invoices?status=finalized" },
    { label: "Overdue", href: "/dashboard/invoices?status=overdue" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  customers: [
    { label: "All Customers", href: "/dashboard/customers" },
    { label: "Add Customer", href: "/dashboard/customers?create=1" },
    { label: "GST Customers", href: "/dashboard/customers?gst=yes" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  employees: [
    { label: "Employees", href: "/dashboard/employees" },
    { label: "Payroll", href: "/dashboard/payroll" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  payroll: [
    { label: "Payroll", href: "/dashboard/payroll" },
    { label: "Employees", href: "/dashboard/employees" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  reports: [
    { label: "POS Reports", href: "/dashboard/pos/reports" },
    { label: "POS Invoices", href: "/dashboard/pos/invoices" },
    { label: "Billing", href: "/dashboard/pos" },
  ],
} as const;

export function getCurrentModule(pathname: string): keyof typeof moduleMenus {
  if (pathname.startsWith("/dashboard/pos")) return "pos";
  if (pathname.startsWith("/dashboard/items")) return "items";
  if (pathname.startsWith("/dashboard/vendors")) return "vendors";
  if (
    pathname.startsWith("/dashboard/inventory") ||
    pathname.startsWith("/dashboard/products") ||
    pathname.startsWith("/dashboard/stocks") ||
    pathname.startsWith("/dashboard/brands")
  ) {
    return "inventory";
  }
  if (pathname.startsWith("/dashboard/estimates")) return "estimates";
  if (pathname.startsWith("/dashboard/invoices")) return "invoices";
  if (pathname.startsWith("/dashboard/customers")) return "customers";
  if (pathname.startsWith("/dashboard/employees")) return "employees";
  if (pathname.startsWith("/dashboard/payroll")) return "payroll";

  return "dashboard";
}
