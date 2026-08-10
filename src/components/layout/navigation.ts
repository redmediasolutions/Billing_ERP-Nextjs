export const moduleMenus = {
  dashboard: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "POS Billing", href: "/dashboard/pos" },
    { label: "Invoices", href: "/dashboard/invoices" },
    { label: "Estimates", href: "/dashboard/estimates" },
    { label: "Customers", href: "/dashboard/customers" },
    { label: "Items", href: "/dashboard/items" },
    { label: "Products", href: "/dashboard/products" },
    { label: "Stocks", href: "/dashboard/stocks" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  pos: [
    { label: "Billing", href: "/dashboard/pos" },
    { label: "POS Items", href: "/dashboard/pos/items" },
    { label: "POS Invoices", href: "/dashboard/pos/invoices" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  items: [
    { label: "All Items", href: "/dashboard/items" },
    { label: "Add Item", href: "/dashboard/items?create=1" },
  ],

  estimates: [
    { label: "All Estimates", href: "/dashboard/estimates" },
    { label: "New Estimate", href: "/dashboard/estimates/new" },
  ],

  invoices: [
    { label: "All Invoices", href: "/dashboard/invoices" },
    { label: "New Invoice", href: "/dashboard/invoices/new" },
    { label: "Drafts", href: "/dashboard/invoices?status=draft" },
    { label: "Paid", href: "/dashboard/invoices?status=paid" },
    { label: "Overdue", href: "/dashboard/invoices?status=overdue" },
    { label: "Reports", href: "/dashboard/reports/invoices" },
  ],

  customers: [
    { label: "All Customers", href: "/dashboard/customers" },
    { label: "Add Customer", href: "/dashboard/customers?create=1" },
    { label: "GST Customers", href: "/dashboard/customers?gst=yes" },
    { label: "Outstanding", href: "/dashboard/customers?balance=1" },
    { label: "Reports", href: "/dashboard/reports/customers" },
  ],

  products: [
    { label: "All Products", href: "/dashboard/products" },
    { label: "New Product", href: "/dashboard/products/new" },
    { label: "Brands", href: "/dashboard/brands" },
    { label: "Categories", href: "/dashboard/categories" },
    { label: "Stock", href: "/dashboard/stocks" },
    { label: "Reports", href: "/dashboard/reports/products" },
  ],

  stocks: [
    { label: "Stock Overview", href: "/dashboard/stocks" },
    { label: "Stock In", href: "/dashboard/stocks/in" },
    { label: "Stock Out", href: "/dashboard/stocks/out" },
    { label: "Adjustments", href: "/dashboard/stocks/adjustments" },
    { label: "Transfers", href: "/dashboard/stocks/transfers" },
    { label: "Reports", href: "/dashboard/reports/stocks" },
  ],

  brands: [
    { label: "All Brands", href: "/dashboard/brands" },
    { label: "New Brand", href: "/dashboard/brands/new" },
    { label: "Products", href: "/dashboard/products" },
    { label: "Categories", href: "/dashboard/categories" },
  ],

  vendors: [
    { label: "All Vendors", href: "/dashboard/vendors" },
    { label: "Add Vendor", href: "/dashboard/vendors/new" },
    { label: "Purchase Orders", href: "/dashboard/purchases" },
    { label: "Payments", href: "/dashboard/purchases/payments" },
    { label: "Reports", href: "/dashboard/reports/vendors" },
  ],

  employees: [
    { label: "Employees", href: "/dashboard/employees" },
    { label: "Add Employee", href: "/dashboard/employees/new" },
    { label: "Attendance", href: "/dashboard/attendance" },
    { label: "Payroll", href: "/dashboard/payroll" },
    { label: "Reports", href: "/dashboard/reports/employees" },
  ],

  payroll: [
    { label: "Payroll", href: "/dashboard/payroll" },
    { label: "Salary Runs", href: "/dashboard/payroll/runs" },
    { label: "Payslips", href: "/dashboard/payroll/payslips" },
    { label: "Advances", href: "/dashboard/payroll/advances" },
    { label: "Reports", href: "/dashboard/reports/payroll" },
  ],

  reports: [
    { label: "Dashboard", href: "/dashboard/reports" },
    { label: "Sales", href: "/dashboard/reports/sales" },
    { label: "Inventory", href: "/dashboard/reports/inventory" },
    { label: "Customers", href: "/dashboard/reports/customers" },
    { label: "Finance", href: "/dashboard/reports/finance" },
    { label: "GST", href: "/dashboard/reports/gst" },
  ],
} as const;

export function getCurrentModule(pathname: string): keyof typeof moduleMenus {
  if (pathname.startsWith("/dashboard/pos")) return "pos";
  if (pathname.startsWith("/dashboard/items")) return "items";
  if (pathname.startsWith("/dashboard/estimates")) return "estimates";
  if (pathname.startsWith("/dashboard/invoices")) return "invoices";
  if (pathname.startsWith("/dashboard/customers")) return "customers";
  if (pathname.startsWith("/dashboard/products")) return "products";
  if (pathname.startsWith("/dashboard/stocks")) return "stocks";
  if (pathname.startsWith("/dashboard/brands")) return "brands";
  if (pathname.startsWith("/dashboard/vendors")) return "vendors";
  if (pathname.startsWith("/dashboard/employees")) return "employees";
  if (pathname.startsWith("/dashboard/payroll")) return "payroll";
  if (pathname.startsWith("/dashboard/reports")) return "reports";

  return "dashboard";
}