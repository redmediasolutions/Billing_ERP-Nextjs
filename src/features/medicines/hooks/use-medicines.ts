"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { medicinesService } from "../services/medicines.service";
import type { MedicineBatchInput, MedicineInput } from "../types";

export const medicineKeys = {
  all: ["medicines"] as const,
  list: () => [...medicineKeys.all, "list"] as const,
  detail: (id: number) => [...medicineKeys.all, "detail", id] as const,
  batches: (medicineId?: number) => [...medicineKeys.all, "batches", medicineId || 0] as const,
};

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: medicineKeys.all });
    // same stock as the ERP Inventory screen
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    queryClient.invalidateQueries({ queryKey: ["clinic"] });
  };
}

export function useMedicines() {
  return useQuery({ queryKey: medicineKeys.list(), queryFn: medicinesService.list });
}

export function useMedicine(id: number | null) {
  return useQuery({
    queryKey: medicineKeys.detail(id || 0),
    queryFn: () => medicinesService.getById(id as number),
    enabled: Boolean(id && id > 0),
  });
}

export function useAvailableBatches(medicineId?: number) {
  return useQuery({
    queryKey: medicineKeys.batches(medicineId),
    queryFn: () => medicinesService.availableBatches(medicineId),
  });
}

export function useSaveMedicine() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: MedicineInput }) =>
      id ? medicinesService.update(id, input) : medicinesService.create(input),
    onSuccess: invalidate,
  });
}

export function useArchiveMedicine() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: number) => medicinesService.archive(id), onSuccess: invalidate });
}

export function useAddBatch() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: MedicineBatchInput) => medicinesService.addBatch(input),
    onSuccess: invalidate,
  });
}

export function useUpdateBatch() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Omit<MedicineBatchInput, "medicine_id"> & { quantity?: number };
    }) => medicinesService.updateBatch(id, input),
    onSuccess: invalidate,
  });
}

export function useAdjustStock() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, type, quantity }: { id: number; type: "add" | "deduct"; quantity: number }) =>
      medicinesService.adjustStock(id, { type, quantity }),
    onSuccess: invalidate,
  });
}
