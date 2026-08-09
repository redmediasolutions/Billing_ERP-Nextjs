"use client";

import { useMemo, useState } from "react";
import { Loader2, Package, Plus, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ItemFormModal } from "@/features/items/addform/item-form-modal";
import { itemsService } from "@/features/items/services/items.service";
import type { ItemInput } from "@/features/items/types";
import { estimateKeys, useCatalogItems } from "../hooks/use-estimates";
import type { CatalogItem } from "../types";

export function ItemPickerDialog({
  onSelect,
}: {
  onSelect: (item: CatalogItem) => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  const { data: items = [], isLoading, error } =
    useCatalogItems(open);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return items;

    return items.filter((item) =>
      [item.item_name, item.item_code, item.hsn_code || ""].some(
        (value) => value.toLowerCase().includes(term)
      )
    );
  }, [items, search]);

  function addItem(item: CatalogItem) {
    onSelect(item);
    setOpen(false);
    setSearch("");
  }

  async function createItem(input: ItemInput) {
    setSavingItem(true);

    try {
      const created = await itemsService.create(input);

      await queryClient.invalidateQueries({
        queryKey: estimateKeys.items(),
      });

      onSelect({
        id: created.id,
        item_name: created.item_name,
        item_code: created.item_code,
        hsn_code: created.hsn_code,
        item_cost: created.item_cost,
        tax_rate: created.tax_rate,
        unit: created.unit,
        item_description: created.item_description,
      });

      setItemFormOpen(false);
      setOpen(false);
      setSearch("");
    } finally {
      setSavingItem(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" className="item-picker__trigger">
            <Plus size={16} />
            Add Items
          </Button>
        </DialogTrigger>

        <DialogContent className="form-dialog">
          <DialogHeader>
            <DialogTitle>Add Item from Catalogue</DialogTitle>
          </DialogHeader>

          <div className="item-picker__toolbar">
            <div className="item-picker__search">
              <Search className="item-picker__search-icon" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter catalogue items..."
                className="item-picker__search-input"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setItemFormOpen(true)}
            >
              <Plus size={16} />
              New Item
            </Button>
          </div>

          <div className="item-picker__list">
            {isLoading ? (
              <div className="item-picker__state">
                <Loader2 size={20} className="form-spinner" />
              </div>
            ) : error ? (
              <p className="item-picker__state item-picker__state--error">
                Unable to load items.
              </p>
            ) : filteredItems.length === 0 ? (
              <p className="item-picker__state">
                No catalogue items found.
              </p>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addItem(item)}
                  className="item-picker__row"
                >
                  <div className="item-picker__item">
                    <div className="item-picker__icon">
                      <Package size={16} />
                    </div>

                    <div>
                      <p className="item-picker__name">{item.item_name}</p>
                      <p className="item-picker__meta">
                        {item.item_code} · {item.unit || "PCS"}
                      </p>
                    </div>
                  </div>

                  <div className="item-picker__price-block">
                    <p className="item-picker__price">
                      ₹{Number(item.item_cost).toFixed(2)}
                    </p>
                    <p className="item-picker__tax">
                      GST {Number(item.tax_rate)}%
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {itemFormOpen && (
        <ItemFormModal
          item={null}
          open={itemFormOpen}
          onClose={() => setItemFormOpen(false)}
          onSave={createItem}
        />
      )}

      {savingItem && (
        <div className="form-loading form-loading--overlay">
          <Loader2 className="form-loading__spinner" />
        </div>
      )}
    </>
  );
}
