"use client";

import { useState } from "react";
import { Edit3, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomerFormModal } from "../addform/customer-form-modal";
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
    <div className="customer-picker">
      <Label className="form-field__label">{label}</Label>

      <div className="customer-picker__row">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="employee-form__select customer-picker__select"
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

        <Button
          type="button"
          variant="outline"
          onClick={openCreate}
          className="customer-picker__action"
        >
          <Plus size={16} />
          New
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={!selectedCustomer}
          onClick={openEdit}
          className="customer-picker__action"
        >
          <Edit3 size={16} />
          Edit
        </Button>
      </div>

      {formOpen && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => {
            setFormOpen(false);
            setEditingCustomer(null);
          }}
          onSave={saveCustomer}
        />
      )}
    </div>
  );
}
