"use client";

import { useEffect, useState } from "react";
import { Edit3, Loader2, Plus, Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/lib/use-debounce";
import { CustomerFormSheet } from "../addform/customer-form-sheet";
import {
  customerKeys,
  useCreateCustomer,
  useCustomerSearch,
  useUpdateCustomer,
} from "../hooks/use-customers";
import { estimateKeys } from "@/features/estimates/hooks/use-estimates";
import type { Customer, CustomerInput } from "../types";
import { customerContactName, customerDisplayName } from "../customer-display";

interface CustomerPickerFieldProps {
  value: string;
  onChange: (customerId: string) => void;
  onCustomerSelect?: (customer: Customer | null) => void;
  label?: string;
}

export function CustomerPickerField({
  value,
  onChange,
  onCustomerSelect,
  label = "Select Customer *",
}: CustomerPickerFieldProps) {
  const queryClient = useQueryClient();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const debouncedQuery = useDebounce(query);
  const { data: customers = [], isFetching } = useCustomerSearch(debouncedQuery);

  useEffect(() => {
    if (!value) {
      setSelectedCustomer(null);
      onCustomerSelect?.(null);
    }
  }, [value, onCustomerSelect]);

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
      setSelectedCustomer(created);
      onCustomerSelect?.(created);
    }

    invalidateCustomers();
    setFormOpen(false);
    setEditingCustomer(null);
  }

  function selectCustomer(customer: Customer) {
    onChange(String(customer.id));
    setSelectedCustomer(customer);
    onCustomerSelect?.(customer);
    setQuery("");
  }

  function clearCustomer() {
    onChange("");
    setSelectedCustomer(null);
    onCustomerSelect?.(null);
    setQuery("");
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative w-full">
          {selectedCustomer ? (
            <div className="flex h-9 items-center justify-between rounded-md border border-input px-3 text-sm">
              <span className="truncate">
                {customerDisplayName(selectedCustomer)}
                {selectedCustomer.customer_phone ? ` · ${selectedCustomer.customer_phone}` : ""}
              </span>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={clearCustomer}>
                <X className="h-4 w-4" />
                <span className="sr-only">Clear selected customer</span>
              </Button>
            </div>
          ) : (
            <>
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search display name, contact, or phone..."
                className="pl-9"
                autoComplete="off"
              />
            </>
          )}

          {!selectedCustomer && debouncedQuery.trim().length >= 2 && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
              {isFetching ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching customers...
                </div>
              ) : customers.length ? (
                customers.map((customer) => (
                  <button key={customer.id} type="button" onClick={() => selectCustomer(customer)} className="block w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent">
                    <span className="block font-medium">{customerDisplayName(customer)}</span>
                    <span className="block text-xs text-muted-foreground">{[customerContactName(customer), customer.customer_phone, customer.customer_email].filter(Boolean).join(" · ")}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">No matching customers found.</p>
              )}
            </div>
          )}
          {!selectedCustomer && query.trim().length > 0 && query.trim().length < 2 && (
            <p className="mt-1 text-xs text-muted-foreground">Type at least 2 characters to search.</p>
          )}
        </div>

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
