"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/features/products/hooks/use-products";

import {
  useCreateWarrantyPolicy,
  useUpdateWarrantyPolicy,
  useWarrantyPolicies,
} from "../hooks/use-warranty";
import type { CoverageType, WarrantyPolicyInput } from "../types";
import { COVERAGE_TYPES } from "../types";

const emptyPolicy: WarrantyPolicyInput = {
  policy_name: "",
  product_ref: null,
  coverage_months: 12,
  coverage_type: "manufacturer",
  covers_parts: true,
  covers_labor: true,
  max_claims: null,
  terms: "",
  is_active: true,
};

export function PoliciesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: policies = [], isLoading } = useWarrantyPolicies();
  const { data: products = [] } = useProducts();
  const createPolicy = useCreateWarrantyPolicy();
  const updatePolicy = useUpdateWarrantyPolicy();
  const [form, setForm] = useState<WarrantyPolicyInput>(emptyPolicy);
  const [error, setError] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!form.policy_name.trim()) {
      setError("Name this policy.");
      return;
    }
    try {
      setError("");
      await createPolicy.mutateAsync({
        ...form,
        policy_name: form.policy_name.trim(),
      });
      setForm(emptyPolicy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add policy.");
    }
  }

  async function toggleActive(id: number, input: WarrantyPolicyInput) {
    try {
      setError("");
      await updatePolicy.mutateAsync({
        id,
        input: { ...input, is_active: !input.is_active },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update policy.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Coverage policies</DialogTitle>
          <DialogDescription>
            Default months and coverage type per product. Registration picks the
            matching policy when a serial is linked to that product.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-3 rounded-xl border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Policy name</Label>
              <Input
                value={form.policy_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    policy_name: event.target.value,
                  }))
                }
                placeholder="12-month manufacturer"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Select
                value={form.product_ref ? String(form.product_ref) : "all"}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    product_ref: value === "all" ? null : Number(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Months</Label>
              <Input
                type="number"
                min={1}
                value={form.coverage_months}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    coverage_months: Number(event.target.value) || 12,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Type</Label>
              <Select
                value={form.coverage_type}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    coverage_type: value as CoverageType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COVERAGE_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Terms</Label>
              <Textarea
                value={form.terms}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    terms: event.target.value,
                  }))
                }
                placeholder="What is covered / excluded"
              />
            </div>
          </div>
          <Button type="submit" disabled={createPolicy.isPending}>
            {createPolicy.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add policy"
            )}
          </Button>
        </form>

        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading policies...
          </div>
        ) : (
          <ul className="space-y-2">
            {policies.map((policy) => (
              <li
                key={policy.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium">{policy.policy_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {policy.product_name || "All products"} ·{" "}
                    {policy.coverage_months} months
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toggleActive(policy.id, {
                      policy_name: policy.policy_name,
                      product_ref: policy.product_ref,
                      coverage_months: policy.coverage_months,
                      coverage_type: policy.coverage_type,
                      covers_parts: policy.covers_parts,
                      covers_labor: policy.covers_labor,
                      max_claims: policy.max_claims,
                      terms: policy.terms || "",
                      is_active: policy.is_active,
                    })
                  }
                >
                  <Badge variant={policy.is_active ? "default" : "outline"}>
                    {policy.is_active ? "Active" : "Off"}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
