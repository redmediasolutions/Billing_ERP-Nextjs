"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/features/pos/ui/input";
import { usePosItems } from "@/features/pos/hooks/use-pos-items";
import { ItemPickerGrid } from "@/features/pos/invoices/components/ItemPickerGrid";
import { CartPanel } from "@/features/pos/invoices/components/CartPanel";
import { MobileCartBar } from "@/features/pos/invoices/components/MobileCartBar";
import "./billing.css";

export default function BillingPage() {
  const { items, loading } = usePosItems();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Items");

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
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
          <div style={{ position: "relative", maxWidth: 340, width: "100%" }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: 11, color: "var(--text-faint)" }} />
            <Input placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
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

        {loading ? (
          <p className="text-sm text-muted" style={{ padding: "24px 0" }}>Loading menu…</p>
        ) : (
          <ItemPickerGrid items={filtered} />
        )}
      </div>
      <CartPanel />
      <MobileCartBar />
    </div>
  );
}
