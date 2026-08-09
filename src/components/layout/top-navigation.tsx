"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  ReceiptText,
  Search,
  Tags,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/features/tenant/hooks/use-tenant";
import {
  APP_MODULES,
  MODULE_NAV_LINKS,
  resolveActiveModule,
} from "./module-actions";
import styles from "./top-navigation.module.css";

const PICKER_MODULES = APP_MODULES.map((module) => ({
  ...module,
  icon:
    module.href === "/dashboard"
      ? LayoutDashboard
      : module.icon,
}));

export function TopNavigation() {
  const pathname = usePathname();
  const { data: tenant } = useTenant();
  const menuRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const activeModule = resolveActiveModule(pathname);

  const visibleModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return PICKER_MODULES;
    return PICKER_MODULES.filter((module) =>
      module.label.toLowerCase().includes(query)
    );
  }, [search]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className={styles.topNavigation} data-top-navigation>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.moduleMenu} ref={menuRef}>
            <Button
              type="button"
              variant="ghost"
              className={styles.businessButton}
              onClick={() => setOpen((current) => !current)}
              aria-expanded={open}
            >
              <span className={styles.businessMark}>B</span>
              <span className={styles.businessName}>
                {tenant?.business_name || "Billing ERP"}
              </span>
              <ChevronDown
                size={16}
                className={open ? styles.chevronOpen : ""}
              />
            </Button>

            {open ? (
              <div className={styles.dropdown}>
                <div className={styles.searchField}>
                  <Search size={16} />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search modules..."
                    className={styles.searchInput}
                    autoFocus
                  />
                </div>

                <p className={styles.dropdownLabel}>Modules</p>

                <div className={styles.moduleList}>
                  {visibleModules.map((module) => {
                    const Icon = module.icon;

                    return (
                      <Link
                        key={module.href}
                        href={module.href}
                        onClick={() => {
                          setOpen(false);
                          setSearch("");
                        }}
                        className={`${styles.moduleLink} ${
                          isActive(module.href) ? styles.moduleLinkActive : ""
                        }`}
                      >
                        <Icon size={17} />
                        <span>{module.label}</span>
                      </Link>
                    );
                  })}

                  {visibleModules.length === 0 ? (
                    <p className={styles.noResults}>No matching module.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <nav className={styles.quickLinks} aria-label="Quick navigation">
            {MODULE_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive(link.href) ? styles.quickLinkActive : styles.quickLink
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.center}>
          <Badge className={styles.moduleBadge}>{activeModule.label}</Badge>
        </div>

        <div className={styles.actions}>
          {activeModule.actions.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={`${action.href}-${action.label}`}
                variant={action.variant ?? "outline"}
                className={styles.actionButton}
                asChild
              >
                <Link href={action.href}>
                  {Icon ? <Icon size={15} /> : null}
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
