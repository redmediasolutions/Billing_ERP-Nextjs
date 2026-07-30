"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { stockRepository } from "../repository/stock-repository";
import type {
  SellStockInput,
  StockInput,
  StockUpdateInput,
} from "../types/stock.types";

const STOCKS_KEY = ["stocks"];

export function useStocks(search = "", status = "") {
  return useQuery({
    queryKey: [...STOCKS_KEY, search, status],
    queryFn: () => stockRepository.getAll(search, status),
  });
}

export function useStockCustomers() {
  return useQuery({
    queryKey: ["stock-customers"],
    queryFn: stockRepository.getCustomers,
  });
}

export function useCreateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StockInput) => stockRepository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCKS_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: StockUpdateInput;
    }) => stockRepository.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: STOCKS_KEY }),
  });
}

export function useSellStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: SellStockInput;
    }) => stockRepository.sell(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCKS_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useDeleteStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => stockRepository.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCKS_KEY });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}