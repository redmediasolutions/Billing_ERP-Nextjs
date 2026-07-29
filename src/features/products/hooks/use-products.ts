"use client";

import { useCallback, useEffect, useState } from "react";
import { productsService } from "../services/products.service";
import type { Product, ProductInput } from "../types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await productsService.list();
      setProducts(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function create(input: ProductInput) {
    const newProduct = await productsService.create(input);

    setProducts((current) => [newProduct, ...current]);
  }

  async function update(id: number, input: ProductInput) {
    const updatedProduct = await productsService.update(id, input);

    setProducts((current) =>
      current.map((product) =>
        product.id === id ? updatedProduct : product
      )
    );
  }

  async function remove(id: number) {
    await productsService.remove(id);

    setProducts((current) =>
      current.filter((product) => product.id !== id)
    );
  }

  return {
    products,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}
