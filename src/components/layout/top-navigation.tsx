"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Search,
  Star,
} from "lucide-react";

import {
  moduleMenus,
  getCurrentModule,
} from "./navigation";
import { useMobileNavPrefs } from "./mobile-nav-prefs";
import { NAV_MODULE_GROUPS } from "./nav-modules";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileMenu } from "@/components/profile-menu";
import { buildSearchUrl, isNavLinkActive } from "@/lib/erp-search";
import { BusinessLogo } from "@/features/tenant/components/business-logo";
import { useTenant } from "@/features/tenant/hooks/use-tenant";
import { isPosOnlyTenant } from "@/lib/pos-only-tenants";

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
  const { modules, favorites, toggleFavorite } = useMobileNavPrefs();
  const businessName = tenant?.business_name || "Billing ERP";
  const posOnly = isPosOnlyTenant(tenant?.id);

  const activeModule = useMemo(() => {
    const matches = modules.filter((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    matches.sort((a, b) => b.href.length - a.href.length);
    return matches[0] ?? modules[0];
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
  }, [moduleSearch, modules]);

  const favoriteModules = useMemo(
    () =>
      favorites
        .map((href) => filteredModules.find((item) => item.href === href))
        .filter((item) => item != null),
    [favorites, filteredModules]
  );

  const otherModules = useMemo(
    () => filteredModules.filter((item) => !favorites.includes(item.href)),
    [favorites, filteredModules]
  );

  const groupedModules = useMemo(() => {
    const sections = [];

    if (favoriteModules.length > 0) {
      sections.push({ group: "Favorites", items: favoriteModules });
    }

    for (const group of NAV_MODULE_GROUPS) {
      const items = otherModules.filter((item) => item.group === group);
      if (items.length > 0) sections.push({ group, items });
    }

    return sections;
  }, [favoriteModules, otherModules]);

  function submitGlobalSearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildSearchUrl(pathname, globalSearch));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
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
              className="flex max-w-[min(220px,52vw)] items-center gap-2 px-2"
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
              <div className="absolute left-0 mt-2 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-border bg-popover p-3 shadow-xl">
                <div className="relative mb-2">
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
                <p className="mb-2 px-1 text-[11px] leading-4 text-muted-foreground">
                  Star up to 4 for the bottom bar. Remove one before adding another. The rest stay in this list.
                </p>

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
                              const isFavorite = favorites.includes(item.href);
                              const barFull = favorites.length >= 4 && !isFavorite;

                              return (
                                <div
                                  key={item.href}
                                  className={`flex items-center rounded-lg ${
                                    active
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-accent hover:text-accent-foreground"
                                  }`}
                                >
                                  <Link
                                    href={item.href}
                                    onClick={() => {
                                      setOpen(false);
                                      setModuleSearch("");
                                    }}
                                    className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm"
                                  >
                                    <Icon size={15} className="shrink-0" />
                                    <span className="truncate">{item.label}</span>
                                  </Link>
                                  <button
                                    type="button"
                                    aria-label={
                                      isFavorite
                                        ? `Remove ${item.label} from the bottom bar`
                                        : `Pin ${item.label} to the bottom bar`
                                    }
                                    aria-pressed={isFavorite}
                                    disabled={barFull}
                                    title={
                                      barFull
                                        ? "The bottom bar already has 4 modules"
                                        : undefined
                                    }
                                    className="mr-1 grid size-7 shrink-0 place-items-center rounded-md disabled:opacity-40"
                                    onClick={() => toggleFavorite(item.href)}
                                  >
                                    <Star
                                      size={14}
                                      fill={isFavorite ? "currentColor" : "none"}
                                    />
                                  </button>
                                </div>
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

        <div className="ml-auto flex shrink-0 items-center gap-2">
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
