"use client";
import { useState } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { money } from "@/features/pos/lib/money";
import { useCartTotals } from "../hooks/useCart";
import { CartContents } from "./CartPanel";
import "./MobileCartBar.css";

export function MobileCartBar() {
  const { total, totalQuantity } = useCartTotals();
  const [open, setOpen] = useState(false);

  if (totalQuantity === 0) return null;

  return (
    <>
      <button className="mobile-cart-bar" onClick={() => setOpen(true)} type="button">
        <span className="mobile-cart-bar-icon"><ShoppingBag size={16} /><span className="mobile-cart-badge">{totalQuantity}</span></span>
        <span className="flex-1 text-left">
          <span className="eyebrow" style={{ display: "block" }}>Current bill</span>
          <span className="amount" style={{ fontSize: 16 }}>{money(total)}</span>
        </span>
        <ArrowRight size={16} />
      </button>
      {open && (
        <div className="mobile-cart-overlay" onMouseDown={() => setOpen(false)}>
          <div className="mobile-cart-sheet" onMouseDown={(e) => e.stopPropagation()}>
            <CartContents />
          </div>
        </div>
      )}
    </>
  );
}
