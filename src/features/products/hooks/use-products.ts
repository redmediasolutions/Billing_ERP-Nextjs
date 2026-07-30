"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { productRepository } from "../repository/product-repository";
import type { ProductInput } from "../types/product.types";

const PRODUCTS_QUERY_KEY = ["products"];

export function useProducts(search = "") {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, search],
    queryFn: () => productRepository.getAll(search),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProductInput) => productRepository.create(input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEY,
      }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: ProductInput;
    }) => productRepository.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEY,
      }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productRepository.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: PRODUCTS_QUERY_KEY,
      }),
  });
}