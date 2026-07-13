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
        <Button
          type="button"
          className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Items
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl border-zinc-800 bg-[#1e1e24] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Add Item from Catalogue
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter catalogue items..."
            className="border-zinc-700 bg-[#151517] pl-10 text-white"
          />
        </div>

        <div className="max-h-[420px] overflow-y-auto rounded-xl border border-zinc-800">
          {isLoading ? (
            <div className="flex justify-center p-10 text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <p className="p-6 text-sm text-red-300">
              Unable to load items.
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-500">
              No catalogue items found.
            </p>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addItem(item)}
                className="flex w-full items-center justify-between border-b border-zinc-800 px-4 py-4 text-left last:border-0 hover:bg-zinc-800/70"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-zinc-800 p-2 text-[#FFCC00]">
                    <Package className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="font-semibold">{item.item_name}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.item_code} · {item.unit || "PCS"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    ₹{Number(item.item_cost).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
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