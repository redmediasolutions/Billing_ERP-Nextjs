export type DashboardModuleId =
  | "sales"
  | "customers"
  | "catalog"
  | "inventory"
  | "enquiries"
  | "bookings"
  | "warranty"
  | "renewals"
  | "memberships"
  | "expenses";

export interface DashboardModuleOption {
  id: DashboardModuleId;
  label: string;
  description: string;
  group: "Sales" | "Catalog" | "Operations" | "Follow-ups";
}

export interface DashboardLayoutPrefs {
  version: 1;
  modules: DashboardModuleId[];
}
