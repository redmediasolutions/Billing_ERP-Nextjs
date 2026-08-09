"use client";

import { useCallback, useEffect, useState } from "react";
import { itemsService } from "@/features/items/services/items.service";
import type { Item, ItemInput } from "@/features/items/types";
import { useToast } from "@/features/pos/ui/toast";

export function usePosItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsService.list();
      setItems(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load items";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (input: ItemInput) => {
      const created = await itemsService.create(input);
      setItems((prev) => [created, ...prev]);
      toast.success("Item created");
      return created;
    },
    [toast]
  );

  const update = useCallback(
    async (id: number, input: ItemInput) => {
      const updated = await itemsService.update(id, input);
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      toast.success("Item updated");
      return updated;
    },
    [toast]
  );

  const remove = useCallback(
    async (id: number) => {
      await itemsService.remove(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success("Item deleted");
    },
    [toast]
  );

  return { items, loading, error, load, create, update, remove };
}
