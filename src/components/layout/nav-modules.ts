import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BellRing,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  IndianRupee,
  LayoutDashboard,
  Package,
  PhoneCall,
  ReceiptText,
  ShieldCheck,
  Store,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";

export type NavModule = {
  label: string;
  short: string;
  href: string;
  icon: LucideIcon;
  group: string;
};

export const NAV_MODULE_GROUPS = [
  "Home",
  "Sales",
  "Catalog",
  "Operations",
  "People",
  "Platform",
] as const;

export const BASE_NAV_MODULES: NavModule[] = [
  { label: "Dashboard", short: "Home", href: "/dashboard", icon: LayoutDashboard, group: "Home" },
  { label: "POS Billing", short: "POS", href: "/dashboard/pos", icon: Store, group: "Sales" },
  { label: "Invoices", short: "Invoices", href: "/dashboard/invoices", icon: ReceiptText, group: "Sales" },
  { label: "Estimates", short: "Estimates", href: "/dashboard/estimates", icon: ClipboardList, group: "Sales" },
  { label: "Customers", short: "Customers", href: "/dashboard/customers", icon: Users, group: "Sales" },
  { label: "Enquiries", short: "Enquiries", href: "/dashboard/enquiries", icon: PhoneCall, group: "Sales" },
  { label: "Bookings", short: "Bookings", href: "/dashboard/bookings", icon: CalendarDays, group: "Sales" },
  { label: "Warranty", short: "Warranty", href: "/dashboard/warranty", icon: ShieldCheck, group: "Sales" },
  { label: "Renewals", short: "Renewals", href: "/dashboard/renewals", icon: BellRing, group: "Sales" },
  { label: "Memberships", short: "Members", href: "/dashboard/memberships", icon: BadgeCheck, group: "Sales" },
  { label: "Items", short: "Items", href: "/dashboard/items", icon: Package, group: "Catalog" },
  { label: "Inventory", short: "Stock", href: "/dashboard/inventory", icon: Warehouse, group: "Catalog" },
  { label: "Vendors", short: "Vendors", href: "/dashboard/vendors", icon: Truck, group: "Operations" },
  { label: "Expenses", short: "Expenses", href: "/dashboard/expenses", icon: IndianRupee, group: "Operations" },
  { label: "Employees", short: "Staff", href: "/dashboard/employees", icon: UserCog, group: "People" },
  { label: "Payroll", short: "Payroll", href: "/dashboard/payroll", icon: Wallet, group: "People" },
  { label: "Reports", short: "Reports", href: "/dashboard/pos/reports", icon: FileText, group: "Operations" },
];

export const PLATFORM_NAV_MODULE: NavModule = {
  label: "Tenant licences",
  short: "Licences",
  href: "/dashboard/platform/licenses",
  icon: Building2,
  group: "Platform",
};

export const DEFAULT_FAVORITE_HREFS = [
  "/dashboard",
  "/dashboard/pos",
  "/dashboard/invoices",
  "/dashboard/customers",
];

export const FAVORITE_SLOT_COUNT = 4;

export function navModulesFor(isPlatformAdmin: boolean): NavModule[] {
  return isPlatformAdmin
    ? [...BASE_NAV_MODULES, PLATFORM_NAV_MODULE]
    : BASE_NAV_MODULES;
}

export function capFavorites(
  raw: unknown,
  allowed: readonly string[]
): string[] {
  const incoming = Array.isArray(raw)
    ? raw.filter(
        (href): href is string =>
          typeof href === "string" && allowed.includes(href)
      )
    : [];

  const unique: string[] = [];
  for (const href of incoming) {
    if (!unique.includes(href)) unique.push(href);
    if (unique.length === FAVORITE_SLOT_COUNT) break;
  }

  return unique;
}

export function normalizeFavorites(
  raw: unknown,
  allowed: readonly string[]
): string[] {
  const unique = capFavorites(raw, allowed);
  const fillers = [...DEFAULT_FAVORITE_HREFS, ...allowed];

  for (const href of fillers) {
    if (unique.length === FAVORITE_SLOT_COUNT) break;
    if (allowed.includes(href) && !unique.includes(href)) unique.push(href);
  }

  return unique;
}

export function toggleFavorite(
  current: readonly string[],
  href: string,
  allowed: readonly string[]
): string[] {
  const slots = capFavorites(current, allowed);
  if (!allowed.includes(href)) return slots;

  if (slots.includes(href)) {
    return slots.filter((item) => item !== href);
  }

  if (slots.length >= FAVORITE_SLOT_COUNT) return slots;

  return [...slots, href];
}

export function moduleMatchesPath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function favoriteIsActive(
  pathname: string,
  href: string,
  favorites: readonly string[]
) {
  if (!moduleMatchesPath(pathname, href)) return false;

  return !favorites.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      moduleMatchesPath(pathname, other)
  );
}
