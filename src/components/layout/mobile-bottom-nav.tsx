"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Search } from "lucide-react";

import { useTenant } from "@/features/tenant/hooks/use-tenant";
import { isPosOnlyTenant } from "@/lib/pos-only-tenants";

import { haptic, isAppleTouchDevice } from "./haptics";
import {
  FAVORITE_SLOT_COUNT,
  favoriteIsActive,
  moduleMatchesPath,
} from "./nav-modules";
import { ModuleWheel } from "./module-wheel";
import { useMobileNavPrefs } from "./mobile-nav-prefs";
import "./mobile-bottom-nav.css";

const HOLD_MS = 460;

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: tenant } = useTenant();
  const { modules, favorites, toggleFavorite } = useMobileNavPrefs();
  const [apple, setApple] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const holdTimer = useRef<number | null>(null);
  const held = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const hide =
    pathname.startsWith("/dashboard/pos") || isPosOnlyTenant(tenant?.id);

  useEffect(() => {
    setApple(isAppleTouchDevice());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    const pad = hide
      ? "0px"
      : "calc(5.75rem + env(safe-area-inset-bottom))";
    document.documentElement.style.setProperty("--mobile-nav-pad", pad);
    return () => {
      document.documentElement.style.removeProperty("--mobile-nav-pad");
    };
  }, [hide]);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
    };
  }, []);

  const favoriteModules = useMemo(
    () =>
      favorites
        .map((href) => modules.find((item) => item.href === href))
        .filter((item) => item != null),
    [favorites, modules]
  );

  const barFull = favoriteModules.length >= FAVORITE_SLOT_COUNT;

  const menuModules = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rest = modules.filter((item) => !favorites.includes(item.href));
    const source = term
      ? modules.filter((item) => item.label.toLowerCase().includes(term))
      : rest;
    return source;
  }, [favorites, modules, query]);

  if (hide) return null;

  const moreActive = modules.some(
    (item) =>
      !favorites.includes(item.href) && moduleMatchesPath(pathname, item.href)
  );

  function clearHold() {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  function closeMenu() {
    setMenuOpen(false);
    setQuery("");
  }

  return (
    <nav
      ref={navRef}
      className={`mobile-float-nav ${apple ? "is-ios" : ""}`}
      aria-label="Favorite modules"
      style={
        apple
          ? {
              background: "color-mix(in srgb, var(--background) 28%, transparent)",
              backdropFilter: "blur(40px) saturate(1.8)",
              WebkitBackdropFilter: "blur(40px) saturate(1.8)",
            }
          : undefined
      }
    >
      {menuOpen && (
        <div
          className="mobile-float-menu"
          role="menu"
          style={
            apple
              ? {
                  background: "color-mix(in srgb, var(--background) 42%, transparent)",
                  backdropFilter: "blur(40px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                }
              : undefined
          }
        >
          <div className="mobile-float-search">
            <Search size={16} />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search modules"
              aria-label="Search modules"
            />
          </div>
          <p className="mobile-float-note">
            {barFull
              ? "Spin to open. Hold a bottom icon to free a spot."
              : `Spin to open. ${FAVORITE_SLOT_COUNT - favoriteModules.length} spots left on the bar.`}
          </p>
          <ModuleWheel
            items={menuModules}
            favoriteHrefs={favorites}
            pinLocked={barFull}
            initialHref={
              menuModules.find((item) => moduleMatchesPath(pathname, item.href))
                ?.href
            }
            onToggleFavorite={toggleFavorite}
            onActivate={(href) => {
              router.push(href);
              closeMenu();
            }}
          />
        </div>
      )}

      <div className="mobile-float-tabs">
        {favoriteModules.map((item) => {
          const Icon = item.icon;
          const active = favoriteIsActive(pathname, item.href, favorites);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-float-tab ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onContextMenu={(event) => event.preventDefault()}
              onPointerDown={() => {
                held.current = false;
                haptic("impact");
                clearHold();
                holdTimer.current = window.setTimeout(() => {
                  held.current = true;
                  toggleFavorite(item.href);
                }, HOLD_MS);
              }}
              onPointerUp={clearHold}
              onPointerLeave={clearHold}
              onPointerCancel={clearHold}
              onClick={(event) => {
                if (held.current) {
                  event.preventDefault();
                  held.current = false;
                }
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.4 : 2} />
              <span>{item.short}</span>
            </Link>
          );
        })}

        <button
          type="button"
          className={`mobile-float-tab ${moreActive ? "is-active" : ""}`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => {
            haptic("impact");
            if (menuOpen) closeMenu();
            else setMenuOpen(true);
          }}
        >
          <LayoutGrid size={18} strokeWidth={moreActive ? 2.4 : 2} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
