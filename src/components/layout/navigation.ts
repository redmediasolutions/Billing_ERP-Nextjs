export const moduleMenus = {
  dashboard: [
    { label: "Overview", href: "/dashboard" },
    { label: "Customize", href: "/dashboard?customize=1" },
    { label: "POS", href: "/dashboard/pos" },
    { label: "Invoices", href: "/dashboard/invoices" },
    { label: "Bookings", href: "/dashboard/bookings" },
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

  expenses: [
    { label: "All Expenses", href: "/dashboard/expenses" },
    { label: "This Month", href: "/dashboard/expenses?filter=month" },
    { label: "Unpaid", href: "/dashboard/expenses?filter=unpaid" },
    { label: "Parts", href: "/dashboard/expenses?filter=parts" },
    { label: "Parcel", href: "/dashboard/expenses?filter=parcel" },
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
    { label: "Partially paid", href: "/dashboard/invoices?status=partial" },
    { label: "Paid", href: "/dashboard/invoices?status=paid" },
    { label: "Overdue", href: "/dashboard/invoices?status=overdue" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  customers: [
    { label: "All Customers", href: "/dashboard/customers" },
    { label: "Add Customer", href: "/dashboard/customers?create=1" },
    { label: "GST Customers", href: "/dashboard/customers?gst=yes" },
    { label: "Reports", href: "/dashboard/pos/reports" },
  ],

  enquiries: [
    { label: "All Enquiries", href: "/dashboard/enquiries" },
    { label: "Due Today", href: "/dashboard/enquiries?filter=today" },
    { label: "Overdue", href: "/dashboard/enquiries?filter=overdue" },
    { label: "New", href: "/dashboard/enquiries?filter=new" },
    { label: "Won", href: "/dashboard/enquiries?filter=won" },
  ],

  bookings: [
    { label: "All Bookings", href: "/dashboard/bookings" },
    { label: "Calendar", href: "/dashboard/bookings?view=calendar" },
    { label: "Today", href: "/dashboard/bookings?filter=today" },
    { label: "In progress", href: "/dashboard/bookings?filter=in_progress" },
    { label: "Resources", href: "/dashboard/bookings/resources" },
  ],

  warranty: [
    { label: "Registrations", href: "/dashboard/warranty" },
    { label: "Claims", href: "/dashboard/warranty?view=claims" },
    { label: "Active", href: "/dashboard/warranty?filter=active" },
    { label: "Expiring", href: "/dashboard/warranty?filter=expiring" },
    { label: "Open claims", href: "/dashboard/warranty?filter=open_claims&view=claims" },
  ],

  memberships: [
    { label: "Members", href: "/dashboard/memberships" },
    { label: "Plans", href: "/dashboard/memberships?view=plans" },
    { label: "Active", href: "/dashboard/memberships?filter=active" },
    { label: "Expiring", href: "/dashboard/memberships?filter=expiring" },
    { label: "Expired", href: "/dashboard/memberships?filter=expired" },
  ],

  renewals: [
    { label: "All renewals", href: "/dashboard/renewals" },
    { label: "Due today", href: "/dashboard/renewals?filter=today" },
    { label: "Overdue", href: "/dashboard/renewals?filter=overdue" },
    { label: "Service", href: "/dashboard/renewals?filter=service" },
    { label: "Payments", href: "/dashboard/renewals?filter=payment" },
    { label: "Contracts", href: "/dashboard/renewals?filter=renewal" },
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

  subscription: [
    { label: "Software licence", href: "/dashboard/subscription" },
  ],

  // ---- Clinic (merged from Anwy Med)
  clinic: [
    { label: "Overview", href: "/dashboard/clinic" },
    { label: "New Bill", href: "/dashboard/clinic/billing" },
    { label: "Appointments", href: "/dashboard/appointments" },
    { label: "Consultations", href: "/dashboard/consultations" },
    { label: "Invoices", href: "/dashboard/invoices" },
  ],

  patients: [
    { label: "All Patients", href: "/dashboard/patients" },
    { label: "Register", href: "/dashboard/patients?create=1" },
    { label: "Archived", href: "/dashboard/patients?view=archived" },
  ],

  appointments: [
    { label: "Today", href: "/dashboard/appointments" },
    { label: "Upcoming", href: "/dashboard/appointments?view=upcoming" },
    { label: "All", href: "/dashboard/appointments?view=all" },
    { label: "Book", href: "/dashboard/appointments?create=1" },
  ],

  consultations: [
    { label: "All", href: "/dashboard/consultations" },
    { label: "In progress", href: "/dashboard/consultations?filter=draft" },
    { label: "Not billed", href: "/dashboard/consultations?filter=unbilled" },
    { label: "Archived", href: "/dashboard/consultations?filter=archived" },
  ],

  medicines: [
    { label: "All Medicines", href: "/dashboard/medicines" },
    { label: "Low stock", href: "/dashboard/medicines?filter=low" },
    { label: "Expiring", href: "/dashboard/medicines?filter=expiring" },
    { label: "Services", href: "/dashboard/clinic-services" },
  ],

  clinicServices: [
    { label: "Services", href: "/dashboard/clinic-services" },
    { label: "Add Service", href: "/dashboard/clinic-services?create=1" },
    { label: "Medicines", href: "/dashboard/medicines" },
  ],

  platform: [
    { label: "Tenant licences", href: "/dashboard/platform/licenses" },
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
  if (pathname.startsWith("/dashboard/expenses")) return "expenses";
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
  if (pathname.startsWith("/dashboard/enquiries")) return "enquiries";
  if (pathname.startsWith("/dashboard/bookings")) return "bookings";
  if (pathname.startsWith("/dashboard/warranty")) return "warranty";
  if (pathname.startsWith("/dashboard/memberships")) return "memberships";
  if (
    pathname.startsWith("/dashboard/renewals") ||
    pathname.startsWith("/dashboard/reminders")
  ) {
    return "renewals";
  }
  if (pathname.startsWith("/dashboard/employees")) return "employees";
  if (pathname.startsWith("/dashboard/payroll")) return "payroll";
  if (pathname.startsWith("/dashboard/subscription")) return "subscription";
  if (pathname.startsWith("/dashboard/clinic-services")) return "clinicServices";
  if (pathname.startsWith("/dashboard/clinic")) return "clinic";
  if (pathname.startsWith("/dashboard/patients")) return "patients";
  if (pathname.startsWith("/dashboard/appointments")) return "appointments";
  if (pathname.startsWith("/dashboard/consultations")) return "consultations";
  if (pathname.startsWith("/dashboard/medicines")) return "medicines";
  if (pathname.startsWith("/dashboard/platform")) return "platform";

  return "dashboard";
}
