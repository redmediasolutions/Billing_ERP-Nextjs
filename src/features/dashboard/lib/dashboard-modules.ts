import type { DashboardModuleId, DashboardModuleOption } from "../types";

export const DASHBOARD_MODULE_OPTIONS: DashboardModuleOption[] = [
  {
    id: "sales",
    label: "Sales & billing",
    description: "Revenue, invoices, POS sales today, recent invoices",
    group: "Sales",
  },
  {
    id: "customers",
    label: "Customers",
    description: "Customer count and estimates",
    group: "Sales",
  },
  {
    id: "catalog",
    label: "Catalog",
    description: "Items, products, brands, low stock alerts",
    group: "Catalog",
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Stock units and inventory snapshot links",
    group: "Catalog",
  },
  {
    id: "expenses",
    label: "Expenses",
    description: "Spending this month",
    group: "Operations",
  },
  {
    id: "enquiries",
    label: "Enquiries",
    description: "Follow-ups due today",
    group: "Follow-ups",
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "Appointments and stays today",
    group: "Follow-ups",
  },
  {
    id: "warranty",
    label: "Warranty",
    description: "Registrations expiring soon",
    group: "Follow-ups",
  },
  {
    id: "renewals",
    label: "Renewals",
    description: "Service, payments, and contract renewals due today",
    group: "Follow-ups",
  },
];

export const DEFAULT_DASHBOARD_MODULES: DashboardModuleId[] =
  DASHBOARD_MODULE_OPTIONS.map((item) => item.id);

export const DASHBOARD_MODULE_GROUPS = [
  "Sales",
  "Catalog",
  "Operations",
  "Follow-ups",
] as const;

export function isModuleEnabled(
  enabled: Set<DashboardModuleId>,
  id: DashboardModuleId
) {
  return enabled.has(id);
}
