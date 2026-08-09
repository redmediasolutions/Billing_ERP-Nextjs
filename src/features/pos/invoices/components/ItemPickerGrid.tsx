"use client";
import { ImageOff, Plus } from "lucide-react";
import { Item } from "@/features/items/types";
import { money } from "@/features/pos/lib/money";
import { useCart, priceFor } from "../hooks/useCart";
import "./ItemPickerGrid.css";

export function ItemPickerGrid({ items }: { items: Item[] }) {
  const { addItem, channel } = useCart();

  if (items.length === 0) {
    return <p className="text-sm text-muted" style={{ padding: "40px 0", textAlign: "center" }}>No items match your search.</p>;
  }

  return (
    <div className="picker-grid">
      {items.map((item) => {
        const price = priceFor(item, channel);
        return (
          <button key={item.id} type="button" className="picker-card" onClick={() => addItem(item)}>
            <div className="picker-thumb">
              {item.item_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.item_image} alt="" />
              ) : (
                <ImageOff size={20} />
              )}
              <span className="picker-add"><Plus size={14} /></span>
            </div>
            <div className="picker-body">
              <div className="picker-name truncate">{item.item_name}</div>
              <div className="flex items-center justify-between" style={{ marginTop: 4 }}>
                <span className="picker-unit text-xs text-faint">{item.unit}</span>
                <span className="amount">{money(price)}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
