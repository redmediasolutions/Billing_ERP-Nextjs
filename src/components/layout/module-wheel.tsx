"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

import { haptic } from "./haptics";
import type { NavModule } from "./nav-modules";
import "./module-wheel.css";

const ITEM_H = 48;
const LOOP_COPIES = 3;

type ModuleWheelProps = {
  items: NavModule[];
  favoriteHrefs: readonly string[];
  initialHref?: string;
  onActivate: (href: string) => void;
  onToggleFavorite: (href: string) => void;
  onCenterChange?: (href: string) => void;
  pinLocked?: boolean;
};

export function ModuleWheel({
  items,
  favoriteHrefs,
  initialHref,
  onActivate,
  onToggleFavorite,
  onCenterChange,
  pinLocked = false,
}: ModuleWheelProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const centerHref = useRef(initialHref ?? items[0]?.href ?? "");
  const armed = useRef(false);
  const jumping = useRef(false);
  const frame = useRef<number | null>(null);
  const [centeredHref, setCenteredHref] = useState(
    initialHref ?? items[0]?.href ?? ""
  );

  const itemKey = items.map((item) => item.href).join("|");
  const loop = items.length > 1;
  const looped = Array.from({ length: loop ? LOOP_COPIES : 1 }, () => items).flat();

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || items.length === 0) return;

    const preferred =
      centerHref.current && items.some((item) => item.href === centerHref.current)
        ? centerHref.current
        : initialHref && items.some((item) => item.href === initialHref)
          ? initialHref
          : items[0].href;
    const index = Math.max(
      0,
      items.findIndex((item) => item.href === preferred)
    );
    const setHeight = items.length * ITEM_H;
    el.scrollTop = (loop ? setHeight : 0) + index * ITEM_H;
    const href = items[index]?.href ?? preferred;
    centerHref.current = href;
    setCenteredHref(href);
    paint(el);
    // Align once when the list itself changes (search or a new favorite order).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey, loop]);

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  function paint(el: HTMLDivElement) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viewCenter = el.scrollTop + el.clientHeight / 2;
    const nodes = el.querySelectorAll<HTMLButtonElement>("[data-wheel-item]");

    nodes.forEach((node) => {
      const dist = (node.offsetTop + ITEM_H / 2 - viewCenter) / ITEM_H;
      const angle = Math.max(-3, Math.min(3, dist)) * -24;
      node.style.opacity = String(
        Math.max(0.28, 1 - Math.min(Math.abs(dist) * 0.28, 0.72))
      );
      node.style.transform = reduce
        ? "none"
        : `rotateX(${angle}deg) translateZ(${Math.max(0, 18 - Math.abs(dist) * 8)}px)`;
    });
  }

  function readCenter(el: HTMLDivElement) {
    if (items.length === 0) return undefined;
    const index =
      ((Math.round(el.scrollTop / ITEM_H) % items.length) + items.length) %
      items.length;
    return items[index];
  }

  function normalizeLoop(el: HTMLDivElement) {
    if (!loop) return;
    const setHeight = items.length * ITEM_H;
    if (el.scrollTop < setHeight) {
      jumping.current = true;
      el.scrollTop += setHeight;
      jumping.current = false;
    } else if (el.scrollTop >= setHeight * 2) {
      jumping.current = true;
      el.scrollTop -= setHeight;
      jumping.current = false;
    }
  }

  function onScroll() {
    const el = scrollerRef.current;
    if (!el || jumping.current || items.length === 0) return;

    normalizeLoop(el);
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const current = scrollerRef.current;
      if (!current) return;
      paint(current);
      const item = readCenter(current);
      if (!item || item.href === centerHref.current) return;
      centerHref.current = item.href;
      setCenteredHref(item.href);
      onCenterChange?.(item.href);
      if (armed.current) haptic("selection");
    });
  }

  const centered = items.find((item) => item.href === centeredHref) ?? items[0];
  const centeredFavorite = centered
    ? favoriteHrefs.includes(centered.href)
    : false;
  const starLocked = pinLocked && !centeredFavorite;

  if (items.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
        No modules match your search.
      </p>
    );
  }

  return (
    <div className="module-wheel">
      <div className="module-wheel-band" />
      <button
        type="button"
        className={`module-wheel-star ${centeredFavorite ? "is-favorite" : ""}`}
        aria-label={
          centeredFavorite
            ? `Remove ${centered?.label ?? "module"} from the bottom bar`
            : `Pin ${centered?.label ?? "module"} to the bottom bar`
        }
        aria-pressed={centeredFavorite}
        disabled={starLocked}
        onClick={() => {
          if (!centered || starLocked) return;
          onToggleFavorite(centered.href);
        }}
      >
        <Star
          size={18}
          fill={centeredFavorite ? "currentColor" : "none"}
          strokeWidth={centeredFavorite ? 1.5 : 2}
        />
      </button>
      <div
        ref={scrollerRef}
        className="module-wheel-scroller"
        onScroll={onScroll}
        onPointerDown={() => {
          armed.current = true;
        }}
        role="listbox"
        aria-label="Modules"
      >
        <div className="module-wheel-pad" />
        {looped.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={`${item.href}-${index}`}
              type="button"
              data-wheel-item
              role="option"
              aria-hidden={loop && (index < items.length || index >= items.length * 2)}
              aria-selected={item.href === centeredHref}
              className="module-wheel-item"
              onClick={() => {
                const el = scrollerRef.current;
                if (!el) return;
                const current = readCenter(el);
                if (current?.href === item.href) {
                  haptic("impact");
                  onActivate(item.href);
                  return;
                }
                el.scrollTo({ top: index * ITEM_H, behavior: "smooth" });
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <div className="module-wheel-pad" />
      </div>
    </div>
  );
}
