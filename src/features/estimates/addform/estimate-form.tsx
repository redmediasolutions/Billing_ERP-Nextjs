"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Loader2, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CustomerPickerField } from "@/features/customers/components/customer-picker-field";
import { ItemPickerDialog } from "./item-picker-dialog";
import type { Customer } from "@/features/customers/types";
import {
  useCreateEstimate,
  useEstimate,
  useUpdateEstimate,
} from "../hooks/use-estimates";
import type {
  CatalogItem,
  Estimate,
  EstimateInput,
  EstimateLineItem,
} from "../types";

function localDate() {
  return new Date().toISOString().slice(0, 10);
}

function createLineItem(item: CatalogItem): EstimateLineItem {
  const quantity = 1;
  const unitPrice = Number(item.item_cost || 0);
  const taxRate = Number(item.tax_rate || 0);
  const amountBeforeTax = quantity * unitPrice;
  const taxAmount = (amountBeforeTax * taxRate) / 100;

  return {
    id: crypto.randomUUID(),
    item_id: item.id,
    item_name: item.item_name,
    hsn_code: item.hsn_code || "",
    unit: item.unit || "PCS",
    description: item.item_description || "",
    quantity,
    unit_price: unitPrice,
    amount_before_tax: amountBeforeTax,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    line_discount: 0,
    line_total: amountBeforeTax + taxAmount,
  };
}

function mapLineItems(lines: EstimateLineItem[]): EstimateLineItem[] {
  return lines.map((line) => ({
    ...line,
    id: String(line.id),
  }));
}

function deriveDiscountPercent(estimate: Estimate): number {
  const lines = estimate.line_items ?? [];
  const subtotal = lines.reduce(
    (sum, line) => sum + line.amount_before_tax,
    0
  );
  const lineDiscount = lines.reduce(
    (sum, line) =>
      sum + (line.amount_before_tax * Number(line.line_discount || 0)) / 100,
    0
  );
  const afterLine = subtotal - lineDiscount;
  const docDiscount = estimate.total_discount - lineDiscount;

  if (afterLine <= 0) return 0;

  return Math.round((docDiscount / afterLine) * 10000) / 100;
}

function recalculateLine(
  line: EstimateLineItem,
  changes: Partial<EstimateLineItem>
): EstimateLineItem {
  const next = { ...line, ...changes };

  const amountBeforeTax =
    Number(next.quantity) * Number(next.unit_price);

  const discountAmount =
    (amountBeforeTax * Number(next.line_discount)) / 100;

  const taxableAmount = amountBeforeTax - discountAmount;

  const taxAmount =
    (taxableAmount * Number(next.tax_rate)) / 100;

  return {
    ...next,
    amount_before_tax: amountBeforeTax,
    tax_amount: taxAmount,
    line_total: taxableAmount + taxAmount,
  };
}

interface EstimateFormProps {
  estimateId?: number;
}

export function EstimateForm({ estimateId }: EstimateFormProps) {
  const router = useRouter();
  const isEditing = Boolean(estimateId);

  const createEstimate = useCreateEstimate();
  const updateEstimate = useUpdateEstimate();
  const { data: existing, isLoading: loadingExisting } = useEstimate(
    estimateId ?? 0
  );

  const [customerId, setCustomerId] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [estimateNumber, setEstimateNumber] = useState(
    `EST-${new Date().getFullYear()}-`
  );
  const [estimateDate, setEstimateDate] = useState(localDate());
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [transferInformation, setTransferInformation] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [formError, setFormError] = useState("");
  const [initializedForId, setInitializedForId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!estimateId || !existing || initializedForId === estimateId) return;

    setCustomerId(String(existing.customer_id));
    setBillingAddress(existing.custom_billing_address || "");
    setDeliveryAddress(existing.custom_delivery_address || "");
    setReferenceNumber(existing.reference_number || "");
    setEstimateNumber(existing.estimate_number);
    setEstimateDate(existing.estimate_date || localDate());
    setValidUntil(existing.valid_until || "");
    setPaymentTerms(existing.payment_terms || "");
    setNotes(existing.notes || "");
    setTransferInformation(existing.transfer_information || "");
    setDiscountPercent(deriveDiscountPercent(existing));
    setLineItems(mapLineItems(existing.line_items ?? []));
    setInitializedForId(estimateId);
  }, [estimateId, existing, initializedForId]);

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce(
      (sum, line) => sum + line.amount_before_tax,
      0
    );

    const lineDiscounts = lineItems.reduce(
      (sum, line) =>
        sum +
        (line.amount_before_tax * Number(line.line_discount || 0)) / 100,
      0
    );

    const documentDiscount =
      ((subtotal - lineDiscounts) * discountPercent) / 100;

    const totalTax = lineItems.reduce(
      (sum, line) => sum + line.tax_amount,
      0
    );

    const grandTotal =
      subtotal - lineDiscounts - documentDiscount + totalTax;

    return {
      subtotal,
      totalDiscount: lineDiscounts + documentDiscount,
      totalTax,
      grandTotal,
      roundedTotal: Math.round(grandTotal),
    };
  }, [lineItems, discountPercent]);

  const isPending = createEstimate.isPending || updateEstimate.isPending;

  function addCatalogItem(item: CatalogItem) {
    setLineItems((current) => {
      const existingLine = current.find(
        (line) => line.item_id === item.id
      );

      if (existingLine) {
        return current.map((line) =>
          line.item_id === item.id
            ? recalculateLine(line, {
                quantity: line.quantity + 1,
              })
            : line
        );
      }

      return [...current, createLineItem(item)];
    });
  }

  function updateLine(
    id: string,
    changes: Partial<EstimateLineItem>
  ) {
    setLineItems((current) =>
      current.map((line) =>
        line.id === id ? recalculateLine(line, changes) : line
      )
    );
  }

  function removeLine(id: string) {
    setLineItems((current) =>
      current.filter((line) => line.id !== id)
    );
  }

  async function saveEstimate(isDraft: boolean) {
    if (!customerId) {
      setFormError("Please select a customer.");
      return;
    }

    if (!estimateNumber.trim()) {
      setFormError("Estimate number is required.");
      return;
    }

    if (lineItems.length === 0) {
      setFormError("Add at least one item to this estimate.");
      return;
    }

    try {
      setFormError("");

      const payload: EstimateInput = {
        estimate_number: estimateNumber.trim(),
        reference_number: referenceNumber.trim(),
        customer_id: Number(customerId),
        custom_billing_address: billingAddress,
        custom_delivery_address: deliveryAddress,
        estimate_date: estimateDate,
        valid_until: validUntil,
        payment_terms: paymentTerms,
        subtotal: totals.subtotal,
        total_discount: totals.totalDiscount,
        total_tax: totals.totalTax,
        grand_total: totals.grandTotal,
        rounded_total: totals.roundedTotal,
        notes,
        transfer_information: transferInformation,
        is_draft: isDraft,
        line_items: lineItems,
      };

      if (isEditing && estimateId) {
        await updateEstimate.mutateAsync({ id: estimateId, input: payload });
      } else {
        await createEstimate.mutateAsync(payload);
      }

      router.push("/dashboard/estimates");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save estimate."
      );
    }
  }

  if (isEditing && loadingExisting) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading estimate...
      </div>
    );
  }

  if (isEditing && !existing && !loadingExisting) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-destructive">
          Estimate not found.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/estimates")}
        >
          Back to estimates
        </Button>
      </div>
    );
  }

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/estimates")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {isEditing ? "Edit Estimate" : "Create Estimate"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => void saveEstimate(true)}
          >
            Save Draft
          </Button>

          <Button
            disabled={isPending}
            onClick={() => void saveEstimate(false)}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Finalize Estimate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="h-5 w-5 text-muted-foreground" />
              Customer Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <CustomerPickerField
              value={customerId}
              onChange={setCustomerId}
              onCustomerSelect={(customer: Customer | null) => {
                setBillingAddress(customer?.customer_billing_address || "");
                setDeliveryAddress(customer?.customer_shipping_address || "");
              }}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AddressCard
                title="Billing Address"
                value={billingAddress}
              />

              <AddressCard
                title="Delivery Address"
                value={deliveryAddress}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Estimate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Estimate Number *">
                <Input
                  value={estimateNumber}
                  onChange={(event) =>
                    setEstimateNumber(event.target.value)
                  }
                />
              </Field>

              <Field label="Reference Number">
                <Input
                  value={referenceNumber}
                  onChange={(event) =>
                    setReferenceNumber(event.target.value)
                  }
                  placeholder="Enter reference number"
                />
              </Field>

              <Field label="Estimate Date">
                <Input
                  type="date"
                  value={estimateDate}
                  onChange={(event) =>
                    setEstimateDate(event.target.value)
                  }
                />
              </Field>

              <Field label="Valid Until">
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(event) =>
                    setValidUntil(event.target.value)
                  }
                />
              </Field>
            </div>

            <Field label="Project Notes">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Internal notes or project brief..."
                rows={3}
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Line Items</CardTitle>
          <ItemPickerDialog onSelect={addCatalogItem} />
        </CardHeader>
        <CardContent>
          <Table frameless>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Item Details</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[120px]">Rate</TableHead>
                  <TableHead className="w-[100px]">Tax (%)</TableHead>
                  <TableHead className="w-[100px]">Discount (%)</TableHead>
                  <TableHead className="w-[120px] text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {lineItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Click &ldquo;Add Items&rdquo; to choose catalogue items.
                    </TableCell>
                  </TableRow>
                ) : (
                  lineItems.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {line.item_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {line.unit} · HSN: {line.hsn_code || "—"}
                        </p>
                        <Textarea
                          value={line.description}
                          onChange={(event) =>
                            updateLine(line.id, {
                              description: event.target.value,
                            })
                          }
                          placeholder="Narration for this line item"
                          rows={2}
                          className="mt-2 min-h-0 text-xs"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(line.id, {
                              quantity: Math.max(
                                1,
                                Number(event.target.value)
                              ),
                            })
                          }
                          className="w-20"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unit_price}
                          onChange={(event) =>
                            updateLine(line.id, {
                              unit_price: Number(event.target.value),
                            })
                          }
                          className="w-24"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={line.tax_rate}
                          onChange={(event) =>
                            updateLine(line.id, {
                              tax_rate: Number(event.target.value),
                            })
                          }
                          className="w-20"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={line.line_discount}
                          onChange={(event) =>
                            updateLine(line.id, {
                              line_discount: Number(event.target.value),
                            })
                          }
                          className="w-20"
                        />
                      </TableCell>

                      <TableCell className="text-right font-medium">
                        ₹{line.line_total.toFixed(2)}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(line.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete line item</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment & Transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Payment Terms">
              <Textarea
                value={paymentTerms}
                onChange={(event) =>
                  setPaymentTerms(event.target.value)
                }
                placeholder="e.g. Payment due within 15 days"
                rows={3}
              />
            </Field>

            <Field label="Transfer Information">
              <Textarea
                value={transferInformation}
                onChange={(event) =>
                  setTransferInformation(event.target.value)
                }
                placeholder="Bank details or transfer instructions..."
                rows={3}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <Summary label="Subtotal" value={totals.subtotal} />
            <Summary label="Total Tax" value={totals.totalTax} />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount %</span>
              <Input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(event) =>
                  setDiscountPercent(Number(event.target.value))
                }
                className="w-20 text-right"
              />
            </div>

            <Summary
              label="Total Discount"
              value={totals.totalDiscount}
            />

            <div className="flex items-center justify-between border-t pt-3 font-semibold text-foreground">
              <span className="text-base">Grand Total</span>
              <span className="text-xl text-primary">
                ₹{totals.roundedTotal.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {formError && (
        <p className="text-sm font-medium text-destructive">
          {formError}
        </p>
      )}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function AddressCard({
  title,
  value,
}: {
  title: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-md border bg-muted/40 p-3 space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      <p className="text-xs text-foreground leading-relaxed">
        {value || "Select a customer to populate address"}
      </p>
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">
        ₹{value.toFixed(2)}
      </span>
    </div>
  );
}
