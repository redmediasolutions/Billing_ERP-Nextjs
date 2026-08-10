"use client";

import { useState } from "react";
import { Edit3, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomerFormSheet } from "../addform/customer-form-sheet";
import {
  customerKeys,
  useCreateCustomer,
  useCustomers,
  useUpdateCustomer,
} from "../hooks/use-customers";
import { estimateKeys } from "@/features/estimates/hooks/use-estimates";
import type { Customer, CustomerInput } from "../types";

interface CustomerPickerFieldProps {
  value: string;
  onChange: (customerId: string) => void;
  label?: string;
}

export function CustomerPickerField({
  value,
  onChange,
  label = "Select Customer *",
}: CustomerPickerFieldProps) {
  const queryClient = useQueryClient();
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const selectedCustomer = customers.find(
    (customer) => customer.id === Number(value)
  );

  function invalidateCustomers() {
    void queryClient.invalidateQueries({ queryKey: customerKeys.all });
    void queryClient.invalidateQueries({ queryKey: estimateKeys.customers() });
  }

  function openCreate() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEdit() {
    if (!selectedCustomer) return;
    setEditingCustomer(selectedCustomer);
    setFormOpen(true);
  }

  async function saveCustomer(input: CustomerInput) {
    if (editingCustomer) {
      await updateCustomer.mutateAsync({
        id: editingCustomer.id,
        input,
      });
    } else {
      const created = await createCustomer.mutateAsync(input);
      onChange(String(created.id));
    }

    invalidateCustomers();
    setFormOpen(false);
    setEditingCustomer(null);
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {isLoading ? "Loading customers..." : "Select customer"}
          </option>

          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.customer_name}
              {customer.customer_phone ? ` · ${customer.customer_phone}` : ""}
            </option>
          ))}
        </select>

        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={!selectedCustomer}
            onClick={openEdit}
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <CustomerFormSheet
        open={formOpen}
        customer={editingCustomer}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
        onSave={saveCustomer}
      />
    </div>
  );
}
