"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { money } from "@/features/pos/lib/money";
import { useMediaQuery } from "@/features/pos/lib/use-media-query";
import { useCartTotals } from "../hooks/useCart";
import { CartContents } from "./CartPanel";
import "./MobileCartBar.css";

export function MobileCartBar() {
  const isMobile = useMediaQuery("(max-width: 980px)");
  const { total, totalQuantity } = useCartTotals();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  if (!isMobile || totalQuantity === 0) return null;

  return (
    <>
      {!open && (
        <button className="mobile-cart-bar" onClick={() => setOpen(true)} type="button">
          <span className="mobile-cart-bar-icon">
            <ShoppingBag size={16} />
            <span className="mobile-cart-badge">{totalQuantity}</span>
          </span>
          <span className="flex-1 text-left">
            <span className="eyebrow" style={{ display: "block" }}>Current bill</span>
            <span className="amount" style={{ fontSize: 16 }}>{money(total)}</span>
          </span>
          <ArrowRight size={16} />
        </button>
      )}
      {open && (
        <div className="mobile-cart-overlay" onMouseDown={() => setOpen(false)}>
          <div className="mobile-cart-sheet" onMouseDown={(e) => e.stopPropagation()}>
            <CartContents onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
