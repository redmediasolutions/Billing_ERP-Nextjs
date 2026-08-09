import { LayoutGrid, Package, Receipt, BarChart3 } from "lucide-react";

export const NAV = [
  { href: "/dashboard/pos", label: "Bill", fullLabel: "New Bill", icon: Receipt },
  { href: "/dashboard/pos/items", label: "Items", fullLabel: "Items", icon: Package },
  { href: "/dashboard/pos/invoices", label: "Invoices", fullLabel: "Invoices", icon: LayoutGrid },
  { href: "/dashboard/pos/reports", label: "Reports", fullLabel: "Reports", icon: BarChart3 },
];
