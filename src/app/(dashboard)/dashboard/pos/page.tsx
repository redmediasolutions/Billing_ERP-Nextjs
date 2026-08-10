"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/features/pos/ui/input";
import { Skeleton } from "@/features/pos/ui/skeleton";
import { usePosItems } from "@/features/pos/hooks/use-pos-items";
import { useMediaQuery } from "@/features/pos/lib/use-media-query";
import { ItemPickerGrid } from "@/features/pos/invoices/components/ItemPickerGrid";
import { CartPanel } from "@/features/pos/invoices/components/CartPanel";
import { MobileCartBar } from "@/features/pos/invoices/components/MobileCartBar";
import "./billing.css";

export default function BillingPage() {
  const isMobileCart = useMediaQuery("(max-width: 980px)");
  const { items, loading } = usePosItems();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Items");

  const categories = useMemo(() => {
    const set = new Set(
      items
        .map((i) => i.category)
        .filter((value): value is string => Boolean(value))
    );
    return ["All Items", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matchesCategory = category === "All Items" || i.category === category;
      const matchesSearch =
        !q ||
        i.item_name.toLowerCase().includes(q) ||
        (i.item_description ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, search, category]);

  return (
    <div className="billing-layout">
      <div className="billing-main">
        <div className="billing-toolbar">
          <div className="billing-search">
            <Search size={15} className="billing-search-icon" />
            <Input
              className="billing-search-input"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="billing-categories-wrap">
            <div className="billing-categories scroll-x">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`category-chip ${c === category ? "category-chip-active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="billing-loading">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="billing-loading-card" />
            ))}
          </div>
        ) : (
          <ItemPickerGrid items={filtered} />
        )}
      </div>
      {!isMobileCart && <CartPanel />}
      <MobileCartBar />
    </div>
  );
}
