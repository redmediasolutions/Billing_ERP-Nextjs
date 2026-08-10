"use client";
import { ImageOff } from "lucide-react";
import type { Item } from "@/features/items/types";
import { money } from "@/features/pos/lib/money";
import { useCart, priceFor } from "../hooks/useCart";
import "./ItemPickerGrid.css";

function ItemVisual({ item }: { item: Item }) {
  if (item.item_image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.item_image} alt="" className="picker-image" />
    );
  }

  return (
    <span className="picker-initial" aria-hidden>
      {item.item_name.charAt(0).toUpperCase()}
    </span>
  );
}

export function ItemPickerGrid({ items }: { items: Item[] }) {
  const { addItem, channel } = useCart();

  if (items.length === 0) {
    return (
      <div className="picker-empty">
        <ImageOff size={22} />
        <p>No items match your search.</p>
      </div>
    );
  }

  return (
    <div className="picker-grid">
      {items.map((item) => {
        const price = priceFor(item, channel);
        return (
          <button key={item.id} type="button" className="picker-card" onClick={() => addItem(item)}>
            <div className="picker-visual">
              <ItemVisual item={item} />
            </div>
            <div className="picker-body">
              <div className="picker-name">{item.item_name}</div>
              <div className="picker-footer">
                <span className="picker-unit">{item.unit || "—"}</span>
                <span className="picker-price amount">{money(price)}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
