"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { inventoryService } from "../services/inventory.service";
import type { AddStockInput, UpdateBatchInput } from "../types/inventory.types";

export function useItemBatches(itemId: number, enabled = true) {
  return useQuery({
    queryKey: ["inventory", "batches", itemId],
    queryFn: () => inventoryService.getBatches(itemId),
    enabled: enabled && itemId > 0,
  });
}

export function useItemLedger(itemId: number, enabled = true) {
  return useQuery({
    queryKey: ["inventory", "ledger", itemId],
    queryFn: () => inventoryService.getLedger(itemId),
    enabled: enabled && itemId > 0,
  });
}

export function useAddStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddStockInput) => inventoryService.addStock(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventory", "batches", variables.item_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "ledger", variables.item_id],
      });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", variables.item_id] });
    },
  });
}

export function useUpdateBatch(itemId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      input,
    }: {
      batchId: number;
      input: UpdateBatchInput;
    }) => inventoryService.updateBatch(batchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["inventory", "batches", itemId],
      });
    },
  });
}
