"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/features/pos/ui/button";
import { Input } from "@/features/pos/ui/input";
import { usePosItems } from "@/features/pos/hooks/use-pos-items";
import { ItemsTable } from "@/features/pos/items/components/ItemsTable";
import { ItemForm } from "@/features/pos/items/components/ItemForm";
import type { Item, ItemInput } from "@/features/items/types";
import "./items-page.css";

export default function ItemsPage() {
  const { items, loading, create, update, remove } = usePosItems();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.item_name.toLowerCase().includes(q) ||
        (i.category ?? "").toLowerCase().includes(q) ||
        i.item_code.toLowerCase().includes(q)
    );
  }, [items, query]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    setFormOpen(true);
  }

  async function handleSubmit(input: ItemInput) {
    if (editing) await update(editing.id, input);
    else await create(input);
  }

  return (
    <div className="container-page">
      <div className="items-page-header">
        <div className="items-page-header-top">
          <div>
            <div className="eyebrow">Catalog</div>
            <h1 className="page-title">Items</h1>
            <p className="page-subtitle">
              {items.length} item{items.length === 1 ? "" : "s"} · walk-in &amp; cloud kitchen pricing
            </p>
          </div>
          <Button className="items-page-add" onClick={openCreate}>
            <Plus size={15} /> Add item
          </Button>
        </div>

        <div className="items-page-search">
          <Search size={15} className="items-page-search-icon" />
          <Input
            className="items-page-search-input"
            placeholder="Search items…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <ItemsTable items={filtered} loading={loading} onEdit={openEdit} onDelete={(item) => remove(item.id)} />

      <ItemForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} editing={editing} />
    </div>
  );
}
