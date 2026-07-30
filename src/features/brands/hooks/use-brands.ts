"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { brandRepository } from "../repository/brand-repository";
import type { BrandInput } from "../types/brand.types";

const BRANDS_QUERY_KEY = ["brands"];

export function useBrands() {
  return useQuery({
    queryKey: BRANDS_QUERY_KEY,
    queryFn: brandRepository.getAll,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BrandInput) => brandRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BRANDS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: BrandInput;
    }) => brandRepository.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BRANDS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => brandRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BRANDS_QUERY_KEY,
      });
    },
  });
}