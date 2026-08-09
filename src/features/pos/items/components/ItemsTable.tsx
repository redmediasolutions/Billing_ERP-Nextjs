"use client";
import { useState } from "react";
import { Pencil, Trash2, ImageOff } from "lucide-react";
import { Table, THead, TBody, TR, TH, TD } from "@/features/pos/ui/table";
import { Badge } from "@/features/pos/ui/badge";
import { Button } from "@/features/pos/ui/button";
import { Skeleton } from "@/features/pos/ui/skeleton";
import { money } from "@/features/pos/lib/money";
import { Item } from "@/features/items/types";

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
      <div className="flex flex-col gap-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} style={{ height: 52, borderRadius: 10 }} />)}
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
    <Table>
      <THead>
        <TR>
          <TH>Item</TH>
          <TH>Category</TH>
          <TH>Walk-in</TH>
          <TH>Cloud kitchen</TH>
          <TH>Tax</TH>
          <TH>Stock</TH>
          <TH></TH>
        </TR>
      </THead>
      <TBody>
        {items.map((item) => (
          <TR key={item.id}>
            <TD>
              <div className="flex items-center gap-3">
                {item.item_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.item_image} alt="" className="item-thumb" />
                ) : (
                  <div className="item-thumb-placeholder"><ImageOff size={14} /></div>
                )}
                <div>
                  <div className="font-medium">{item.item_name}</div>
                  <div className="text-xs text-faint mono">{item.item_code} · {item.unit}</div>
                </div>
              </div>
            </TD>
            <TD><Badge variant="outline">{item.category || "Uncategorized"}</Badge></TD>
            <TD className="amount">{money(item.walk_in_price ?? item.item_cost)}</TD>
            <TD className="amount">{money(item.cloud_kitchen_price ?? item.item_cost)}</TD>
            <TD className="mono">{Number(item.tax_rate)}%</TD>
            <TD>
              {item.track_inventory ? (
                <span className="mono">{item.total_stock}</span>
              ) : (
                <span className="text-faint text-sm">Not tracked</span>
              )}
            </TD>
            <TD>
              <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label="Edit">
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} loading={deletingId === item.id} aria-label="Delete">
                  <Trash2 size={14} />
                </Button>
              </div>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
