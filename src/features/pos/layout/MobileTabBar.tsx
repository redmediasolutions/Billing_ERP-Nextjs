"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "./nav";
import "./MobileTabBar.css";

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="mobile-tabbar" aria-label="Primary">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard/pos"
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link key={href} href={href} className={`mobile-tab ${active ? "mobile-tab-active" : ""}`}>
            <Icon size={19} strokeWidth={active ? 2.4 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
