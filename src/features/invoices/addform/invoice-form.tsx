"use client";

import { useMemo, useState } from "react";
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

import { ItemPickerDialog } from "@/features/estimates/addform/item-picker-dialog";
import { useCustomers } from "@/features/customers/hooks/use-customers";
import type { Customer } from "@/features/customers/types";

import { useCreateInvoice } from "../hooks/use-invoices";
import type {
  InvoiceInput,
  InvoiceLineItem,
} from "../types";
import type { CatalogItem } from "@/features/estimates/types";

function localDate() {
  return new Date().toISOString().slice(0, 10);
}

function newLineItem(item: CatalogItem): InvoiceLineItem {
  const quantity = 1;
  const unitPrice = Number(item.item_cost || 0);
  const taxRate = Number(item.tax_rate || 0);
  const amountBeforeTax = quantity * unitPrice;
  const taxAmount = (amountBeforeTax * taxRate) / 100;

  return {
    id: crypto.randomUUID(),
    item_id: item.id,
    batch_id: null,
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

function calculateLine(
  line: InvoiceLineItem,
  changes: Partial<InvoiceLineItem>
): InvoiceLineItem {
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

export function InvoiceForm() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const { data: customers = [], isLoading: loadingCustomers } =
    useCustomers();

  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${new Date().getFullYear()}-`
  );
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(localDate());
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState("SALE");
  const [tableName, setTableName] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [formError, setFormError] = useState("");

  const selectedCustomer = customers.find(
    (customer) => customer.id === Number(customerId)
  );

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce(
      (sum, line) => sum + line.amount_before_tax,
      0
    );

    const lineDiscount = lineItems.reduce(
      (sum, line) =>
        sum +
        (line.amount_before_tax * Number(line.line_discount)) / 100,
      0
    );

    const invoiceDiscount =
      ((subtotal - lineDiscount) * discountPercent) / 100;

    const taxAmount = lineItems.reduce(
      (sum, line) => sum + line.tax_amount,
      0
    );

    const grandTotal =
      subtotal - lineDiscount - invoiceDiscount + taxAmount;

    return {
      subtotal,
      discountAmount: lineDiscount + invoiceDiscount,
      taxAmount,
      grandTotal,
      roundedTotal: Math.round(grandTotal),
    };
  }, [lineItems, discountPercent]);

  function addItem(item: CatalogItem) {
    setLineItems((current) => {
      const existing = current.find(
        (line) => line.item_id === item.id
      );

      if (existing) {
        return current.map((line) =>
          line.item_id === item.id
            ? calculateLine(line, {
                quantity: line.quantity + 1,
              })
            : line
        );
      }

      return [...current, newLineItem(item)];
    });
  }

  function updateLine(
    id: string,
    changes: Partial<InvoiceLineItem>
  ) {
    setLineItems((current) =>
      current.map((line) =>
        line.id === id ? calculateLine(line, changes) : line
      )
    );
  }

  function removeLine(id: string) {
    setLineItems((current) =>
      current.filter((line) => line.id !== id)
    );
  }

  async function saveInvoice(isDraft: boolean) {
    if (!invoiceNumber.trim()) {
      setFormError("Invoice number is required.");
      return;
    }

    if (!customerId) {
      setFormError("Please select a customer.");
      return;
    }

    if (lineItems.length === 0) {
      setFormError("Add at least one item.");
      return;
    }

    try {
      setFormError("");

      const payload: InvoiceInput = {
        invoice_number: invoiceNumber.trim(),
        customer_id: Number(customerId),

        custom_billing_address:
          selectedCustomer?.customer_billing_address || "",

        custom_delivery_address:
          selectedCustomer?.customer_shipping_address || "",

        invoice_date: invoiceDate,
        due_date: dueDate,
        payment_terms: paymentTerms,
        subtotal: totals.subtotal,
        discount_amount: totals.discountAmount,
        tax_amount: totals.taxAmount,
        grand_total: totals.grandTotal,
        rounded_total: totals.roundedTotal,
        notes,
        order_type: orderType,
        table_name: tableName,
        is_draft: isDraft,
        line_items: lineItems,
      };

      await createInvoice.mutateAsync(payload);

      router.push("/dashboard/invoices");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save invoice."
      );
    }
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/invoices")}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create Invoice
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={createInvoice.isPending}
            onClick={() => void saveInvoice(true)}
          >
            Save Draft
          </Button>

          <Button
            disabled={createInvoice.isPending}
            onClick={() => void saveInvoice(false)}
          >
            {createInvoice.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Finalize Invoice
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="h-5 w-5 text-muted-foreground" />
              Customer Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Select Customer *">
              <select
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {loadingCustomers
                    ? "Loading customers..."
                    : "Select customer"}
                </option>

                {customers.map((customer: Customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AddressCard
                title="Billing Address"
                value={selectedCustomer?.customer_billing_address}
              />

              <AddressCard
                title="Delivery Address"
                value={selectedCustomer?.customer_shipping_address}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Invoice Number *">
                <Input
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                />
              </Field>

              <Field label="Order Type">
                <select
                  value={orderType}
                  onChange={(event) => setOrderType(event.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="SALE">Sale</option>
                  <option value="SERVICE">Service</option>
                </select>
              </Field>

              <Field label="Invoice Date">
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(event) => setInvoiceDate(event.target.value)}
                />
              </Field>

              <Field label="Due Date">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </Field>

              <Field label="Table Name">
                <Input
                  value={tableName}
                  onChange={(event) => setTableName(event.target.value)}
                  placeholder="Optional"
                />
              </Field>
            </div>

            <Field label="Notes">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Invoice notes..."
                rows={3}
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Line Items</CardTitle>
          <ItemPickerDialog onSelect={addItem} />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
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
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms & Summary Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={paymentTerms}
              onChange={(event) => setPaymentTerms(event.target.value)}
              placeholder="e.g. Payment due within 15 days"
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <Summary label="Subtotal" value={totals.subtotal} />
            <Summary label="Total Tax" value={totals.taxAmount} />

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
              label="Discount Amount"
              value={totals.discountAmount}
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