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

  const { data: items = [], isLoading, error } = useCatalogItems(open);

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
          <Button type="button">
            <Plus className="mr-2 h-4 w-4" />
            Add Items
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-xl">
          <DialogHeader className="text-left">
            <DialogTitle>Add Item from Catalogue</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter catalogue items..."
                className="pl-9"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setItemFormOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Item
            </Button>
          </div>

          <div className="max-h-[min(420px,50vh)] overflow-y-auto rounded-md border">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : error ? (
              <p className="p-6 text-left text-sm text-destructive">
                Unable to load items.
              </p>
            ) : filteredItems.length === 0 ? (
              <p className="p-6 text-left text-sm text-muted-foreground">
                No catalogue items found.
              </p>
            ) : (
              <ul className="divide-y">
                {filteredItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => addItem(item)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
                          <Package className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 text-left">
                          <p className="truncate font-medium text-foreground">
                            {item.item_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.item_code} · {item.unit || "PCS"}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-foreground">
                          ₹{Number(item.item_cost).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          GST {Number(item.tax_rate)}%
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ItemFormModal
        item={null}
        open={itemFormOpen}
        onClose={() => setItemFormOpen(false)}
        onSave={createItem}
      />

      {savingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </>
  );
}
