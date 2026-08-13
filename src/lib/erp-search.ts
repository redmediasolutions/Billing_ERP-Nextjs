import { getCurrentModule } from "@/components/layout/navigation";

const MODULE_SEARCH_PATHS: Record<string, string> = {
  dashboard: "/dashboard/items",
  pos: "/dashboard/pos/items",
  inventory: "/dashboard/products",
  items: "/dashboard/items",
  vendors: "/dashboard/vendors",
  invoices: "/dashboard/invoices",
  estimates: "/dashboard/estimates",
  customers: "/dashboard/customers",
  employees: "/dashboard/employees",
  payroll: "/dashboard/payroll",
  reports: "/dashboard/pos/invoices",
};

export function getModuleSearchPath(pathname: string) {
  const module = getCurrentModule(pathname);
  return MODULE_SEARCH_PATHS[module] ?? "/dashboard/items";
}

export function buildSearchUrl(pathname: string, query: string) {
  const base = getModuleSearchPath(pathname);
  const trimmed = query.trim();

  if (!trimmed) return base;

  return `${base}?search=${encodeURIComponent(trimmed)}`;
}

export function isNavLinkActive(
  pathname: string,
  searchParams: URLSearchParams,
  href: string
) {
  const [path, queryString] = href.split("?");
  const pathMatches =
    path === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === path || pathname.startsWith(`${path}/`);

  if (!pathMatches) return false;
  if (!queryString) return pathname === path || pathname.startsWith(`${path}/`);

  const expected = new URLSearchParams(queryString);

  for (const [key, value] of expected.entries()) {
    if (searchParams.get(key) !== value) return false;
  }

  return true;
}

export function matchesSearch(
  query: string,
  fields: Array<string | null | undefined>
) {
  const term = query.trim().toLowerCase();

  if (!term) return true;

  return fields.some((field) =>
    (field ?? "").toLowerCase().includes(term)
  );
}
