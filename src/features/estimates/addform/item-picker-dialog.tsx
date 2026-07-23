"use client";

import { useMemo, useState } from "react";
import { Loader2, Package, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCatalogItems } from "../hooks/use-estimates";
import type { CatalogItem } from "../types";

export function ItemPickerDialog({
  onSelect,
}: {
  onSelect: (item: CatalogItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="item-picker__trigger">
          <Plus className="mr-2 h-4 w-4" />
          Add Items
        </Button>
      </DialogTrigger>

      <DialogContent className="form-dialog">
        <DialogHeader>
          <DialogTitle>Add Item from Catalogue</DialogTitle>
        </DialogHeader>

        <div className="item-picker__search">
          <Search className="item-picker__search-icon" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter catalogue items..."
            className="item-picker__search-input"
          />
        </div>

        <div className="item-picker__list">
          {isLoading ? (
            <div className="item-picker__state">
              <Loader2 className="h-5 w-5 animate-spin" />
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
                    <Package className="h-4 w-4" />
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
  );
}