"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  ReceiptText,
  Users,
  Package,
  Warehouse,
  Truck,
  UserCog,
  Wallet,
  IndianRupee,
  PhoneCall,
  CalendarDays,
  FileText,
  Search,
  ShieldCheck,
  Store,
  Building2,
} from "lucide-react";

import {
  moduleMenus,
  getCurrentModule,
} from "./navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileMenu } from "@/components/profile-menu";
import { buildSearchUrl, isNavLinkActive } from "@/lib/erp-search";
import { BusinessLogo } from "@/features/tenant/components/business-logo";
import { useTenant } from "@/features/tenant/hooks/use-tenant";
import { isPosOnlyTenant } from "@/lib/pos-only-tenants";
import { usePlatformAdmin } from "@/hooks/use-platform-admin";

const BASE_MODULES = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Home" },
  { label: "POS Billing", href: "/dashboard/pos", icon: Store, group: "Sales" },
  { label: "Invoices", href: "/dashboard/invoices", icon: ReceiptText, group: "Sales" },
  { label: "Estimates", href: "/dashboard/estimates", icon: ClipboardList, group: "Sales" },
  { label: "Customers", href: "/dashboard/customers", icon: Users, group: "Sales" },
  { label: "Enquiries", href: "/dashboard/enquiries", icon: PhoneCall, group: "Sales" },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays, group: "Sales" },
  { label: "Warranty", href: "/dashboard/warranty", icon: ShieldCheck, group: "Sales" },
  { label: "Items", href: "/dashboard/items", icon: Package, group: "Catalog" },
  { label: "Inventory", href: "/dashboard/inventory", icon: Warehouse, group: "Catalog" },
  { label: "Vendors", href: "/dashboard/vendors", icon: Truck, group: "Operations" },
  { label: "Expenses", href: "/dashboard/expenses", icon: IndianRupee, group: "Operations" },
  { label: "Employees", href: "/dashboard/employees", icon: UserCog, group: "People" },
  { label: "Payroll", href: "/dashboard/payroll", icon: Wallet, group: "People" },
  { label: "Reports", href: "/dashboard/pos/reports", icon: FileText, group: "Operations" },
];

const PLATFORM_MODULE = {
  label: "Tenant licences",
  href: "/dashboard/platform/licenses",
  icon: Building2,
  group: "Platform" as const,
};

const MODULE_GROUPS = [
  "Home",
  "Sales",
  "Catalog",
  "Operations",
  "People",
  "Platform",
] as const;

export function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [moduleSearch, setModuleSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const currentModule = getCurrentModule(pathname);
  const topMenu = moduleMenus[currentModule] ?? [];
  const isDashboardHome = pathname === "/dashboard";
  const { data: tenant } = useTenant();
  const { isPlatformAdmin } = usePlatformAdmin();
  const businessName = tenant?.business_name || "Billing ERP";
  const posOnly = isPosOnlyTenant(tenant?.id);

  const modules = useMemo(
    () =>
      isPlatformAdmin ? [...BASE_MODULES, PLATFORM_MODULE] : BASE_MODULES,
    [isPlatformAdmin]
  );

  const activeModule = useMemo(() => {
    const match = modules.find((item) => {
      if (item.href === "/dashboard") {
        return pathname === "/dashboard";
      }

      return (
        pathname === item.href || pathname.startsWith(`${item.href}/`)
      );
    });

    return match ?? modules[0];
  }, [pathname, modules]);

  const ActiveModuleIcon = activeModule.icon;

  useEffect(() => {
    setGlobalSearch(searchParams.get("search") ?? "");
  }, [pathname, searchParams]);

  useEffect(() => {
    setOpen(false);
    setModuleSearch("");
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setModuleSearch("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const filteredModules = useMemo(() => {
    const term = moduleSearch.trim().toLowerCase();
    if (!term) return modules;
    return modules.filter((item) => item.label.toLowerCase().includes(term));
  }, [moduleSearch]);

  const groupedModules = useMemo(() => {
    return MODULE_GROUPS.map((group) => ({
      group,
      items: filteredModules.filter((item) => item.group === group),
    })).filter((section) => section.items.length > 0);
  }, [filteredModules]);

  function submitGlobalSearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildSearchUrl(pathname, globalSearch));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative shrink-0" ref={menuRef}>
            {posOnly ? (
              <div className="flex max-w-[220px] items-center gap-2 px-3 py-2">
                <BusinessLogo tenant={tenant} size="sm" />
                <span className="truncate font-semibold">{businessName}</span>
              </div>
            ) : (
            <Button
              variant="ghost"
              onClick={() => setOpen((v) => !v)}
              className="flex max-w-[220px] items-center gap-2"
              aria-expanded={open}
              aria-haspopup="menu"
            >
              {isDashboardHome ? (
                <BusinessLogo tenant={tenant} size="sm" />
              ) : (
                <ActiveModuleIcon size={18} />
              )}

              <span className="truncate font-semibold">
                {isDashboardHome ? businessName : activeModule.label}
              </span>

              <ChevronDown
                size={16}
                className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </Button>
            )}

            {!posOnly && open && (
              <div className="absolute mt-2 w-[22rem] rounded-2xl border border-border bg-popover p-3 shadow-xl">
                <div className="relative mb-3">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={moduleSearch}
                    onChange={(event) => setModuleSearch(event.target.value)}
                    placeholder="Search modules..."
                    className="h-9 pl-9"
                  />
                </div>

                {groupedModules.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    No modules match your search.
                  </p>
                ) : (
                  <div className="max-h-[min(28rem,70vh)] space-y-3 overflow-y-auto pr-1">
                    {groupedModules.map((section) => (
                      <div key={section.group}>
                        <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {section.group}
                        </p>
                        <div className="grid grid-cols-2 gap-0.5">
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            const active =
                              item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname === item.href ||
                                  pathname.startsWith(`${item.href}/`);

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                  setOpen(false);
                                  setModuleSearch("");
                                }}
                                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                                  active
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground"
                                }`}
                              >
                                <Icon size={15} className="shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="hidden min-w-0 items-center gap-1 overflow-x-auto md:flex">
            {topMenu.map((item) => {
              const active = isNavLinkActive(pathname, searchParams, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <form
            onSubmit={submitGlobalSearch}
            className="relative hidden lg:block"
          >
            <Search
              size={16}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search..."
              className="h-9 w-44 pl-8 xl:w-56"
            />
          </form>

          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
