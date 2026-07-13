"use client";

import { useCallback, useEffect, useState } from "react";
import { itemsService } from "../services/items.service";
import type { Item, ItemInput } from "../types";

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await itemsService.list();
      setItems(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load items."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function create(input: ItemInput) {
    const newItem = await itemsService.create(input);

    setItems((current) => [newItem, ...current]);
  }

  async function update(id: number, input: ItemInput) {
    const updatedItem = await itemsService.update(id, input);

    setItems((current) =>
      current.map((item) =>
        item.id === id ? updatedItem : item
      )
    );
  }

  async function remove(id: number) {
    await itemsService.remove(id);

    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  return {
    items,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}