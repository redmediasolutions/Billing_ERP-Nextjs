"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Plus } from "lucide-react";
import { Input } from "@/features/pos/ui/input";
import { Button } from "@/features/pos/ui/button";
import { matchesSearch } from "@/lib/erp-search";
import { useUrlSearchParam } from "@/lib/use-url-search";
import { usePosItems } from "@/features/pos/hooks/use-pos-items";
import { ItemsTable } from "@/features/pos/items/components/ItemsTable";
import { ItemForm } from "@/features/pos/items/components/ItemForm";
import type { Item, ItemInput } from "@/features/items/types";
import "./items-page.css";

export function PosItemsPageContent() {
  const { items, loading, create, update, remove } = usePosItems();
  const { value: query, setSearch } = useUrlSearchParam();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) =>
      matchesSearch(query, [
        item.item_name,
        item.category,
        item.item_code,
        item.item_description,
      ])
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
              {filtered.length} item{filtered.length === 1 ? "" : "s"} shown · walk-in &amp; cloud kitchen pricing
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
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <ItemsTable
        items={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={(item) => remove(item.id)}
      />

      <ItemForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        editing={editing}
      />
    </div>
  );
}
