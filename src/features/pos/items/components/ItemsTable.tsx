"use client";

import { useState } from "react";
import { Pencil, Trash2, ImageOff } from "lucide-react";
import { Badge } from "@/features/pos/ui/badge";
import { Button } from "@/features/pos/ui/button";
import { Skeleton } from "@/features/pos/ui/skeleton";
import { money } from "@/features/pos/lib/money";
import type { Item } from "@/features/items/types";
import "./ItemsTable.css";

function ItemVisual({ item }: { item: Item }) {
  if (item.item_image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.item_image} alt="" />
    );
  }
  return <span className="item-card-initial">{item.item_name.charAt(0).toUpperCase()}</span>;
}

function ItemCard({
  item,
  deleting,
  onEdit,
  onDelete,
}: {
  item: Item;
  deleting: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  const walkIn = money(item.walk_in_price ?? item.item_cost);
  const cloud = money(item.cloud_kitchen_price ?? item.item_cost);

  return (
    <article className="item-card">
      <div className="item-card-head">
        <div className="item-card-visual">
          <ItemVisual item={item} />
        </div>
        <div className="item-card-info">
          <div className="item-card-name">{item.item_name}</div>
          <div className="item-card-code mono">{item.item_code}</div>
          <div className="item-card-meta">
            <Badge variant="outline">{item.category || "Uncategorized"}</Badge>
            {item.track_inventory && (
              <span className="item-card-stock mono">Stock {item.total_stock}</span>
            )}
          </div>
        </div>
      </div>

      <div className="item-card-prices">
        <div className="item-card-price">
          <span className="item-card-price-label">Walk-in</span>
          <span className="item-card-price-value amount">{walkIn}</span>
        </div>
        <div className="item-card-price">
          <span className="item-card-price-label">Cloud kitchen</span>
          <span className="item-card-price-value amount">{cloud}</span>
        </div>
      </div>

      <div className="item-card-foot">
        <Button variant="outline" size="sm" className="item-card-action" onClick={() => onEdit(item)}>
          <Pencil size={14} /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="item-card-action item-card-action-danger"
          onClick={() => onDelete(item)}
          loading={deleting}
        >
          <Trash2 size={14} /> Delete
        </Button>
      </div>
    </article>
  );
}

export function ItemsTable({
  items,
  loading,
  onEdit,
  onDelete,
}: {
  items: Item[];
  loading: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(item: Item) {
    if (!confirm(`Delete "${item.item_name}"? This can't be undone.`)) return;
    setDeletingId(item.id);
    try {
      await onDelete(item);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="items-list">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="item-skeleton" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><ImageOff size={18} /></div>
        <div className="empty-state-title">No items yet</div>
        <p className="text-sm">Add your first menu or inventory item to start billing.</p>
      </div>
    );
  }

  return (
    <div className="items-list">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          deleting={deletingId === item.id}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
