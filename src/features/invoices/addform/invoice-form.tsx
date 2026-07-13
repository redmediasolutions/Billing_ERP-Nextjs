"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, FileText, Loader2, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <section className="min-h-screen bg-[#111113] p-5 text-white md:p-8">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/invoices")}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="text-3xl font-bold">Create Invoice</h1>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={createInvoice.isPending}
            onClick={() => void saveInvoice(true)}
            className="border-zinc-700 bg-[#1e1e24]"
          >
            Save Draft
          </Button>

          <Button
            disabled={createInvoice.isPending}
            onClick={() => void saveInvoice(false)}
            className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
          >
            {createInvoice.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            Finalize Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-zinc-800 bg-[#1e1e24] text-white">
          <CardContent className="p-6">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
              <UserRound className="text-[#FFCC00]" />
              Customer Info
            </h2>

            <Field label="Select Customer *">
              <select
                value={customerId}
                onChange={(event) =>
                  setCustomerId(event.target.value)
                }
                className="w-full rounded-lg border border-zinc-700 bg-[#151517] px-3 py-3 text-white outline-none focus:border-[#FFCC00]"
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

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <AddressCard
                title="Billing Address"
                value={
                  selectedCustomer?.customer_billing_address
                }
              />

              <AddressCard
                title="Delivery Address"
                value={
                  selectedCustomer?.customer_shipping_address
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-[#1e1e24] text-white">
          <CardContent className="p-6">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
              <FileText className="text-[#FFCC00]" />
              Invoice Details
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Invoice Number *">
                <Input
                  value={invoiceNumber}
                  onChange={(event) =>
                    setInvoiceNumber(event.target.value)
                  }
                  className="border-zinc-700 bg-[#151517]"
                />
              </Field>

              <Field label="Order Type">
                <select
                  value={orderType}
                  onChange={(event) =>
                    setOrderType(event.target.value)
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-[#151517] px-3 py-2 text-white"
                >
                  <option value="SALE">Sale</option>
                  <option value="SERVICE">Service</option>
                </select>
              </Field>

              <Field label="Invoice Date">
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(event) =>
                    setInvoiceDate(event.target.value)
                  }
                  className="border-zinc-700 bg-[#151517]"
                />
              </Field>

              <Field label="Due Date">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  className="border-zinc-700 bg-[#151517]"
                />
              </Field>

              <Field label="Table Name">
                <Input
                  value={tableName}
                  onChange={(event) =>
                    setTableName(event.target.value)
                  }
                  placeholder="Optional"
                  className="border-zinc-700 bg-[#151517]"
                />
              </Field>
            </div>

            <Field label="Notes" className="mt-5">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Invoice notes..."
                className="min-h-24 border-zinc-700 bg-[#151517]"
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-zinc-800 bg-[#1e1e24] text-white">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-zinc-800 p-6 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold">Line Items</h2>

            <ItemPickerDialog onSelect={addItem} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-4 py-4">Quantity</th>
                  <th className="px-4 py-4">Rate</th>
                  <th className="px-4 py-4">Tax</th>
                  <th className="px-4 py-4">Discount</th>
                  <th className="px-4 py-4 text-right">Amount</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>

              <tbody>
                {lineItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-12 text-center text-zinc-500"
                    >
                      Click “Add Items” to choose catalogue items.
                    </td>
                  </tr>
                ) : (
                  lineItems.map((line) => (
                    <tr
                      key={line.id}
                      className="border-b border-zinc-800/70"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold">
                          {line.item_name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {line.unit} · HSN: {line.hsn_code || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
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
                          className="w-20 border-zinc-700 bg-[#151517]"
                        />
                      </td>

                      <td className="px-4 py-4">
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
                          className="w-28 border-zinc-700 bg-[#151517]"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <Input
                          type="number"
                          min="0"
                          value={line.tax_rate}
                          onChange={(event) =>
                            updateLine(line.id, {
                              tax_rate: Number(event.target.value),
                            })
                          }
                          className="w-20 border-zinc-700 bg-[#151517]"
                        />
                      </td>

                      <td className="px-4 py-4">
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
                          className="w-20 border-zinc-700 bg-[#151517]"
                        />
                      </td>

                      <td className="px-4 py-4 text-right font-bold">
                        ₹{line.line_total.toFixed(2)}
                      </td>

                      <td className="px-4 py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(line.id)}
                          className="text-zinc-500 hover:bg-red-950/40 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.75fr]">
        <Card className="border-zinc-800 bg-[#1e1e24] text-white">
          <CardContent className="p-6">
            <Field label="Payment Terms">
              <Textarea
                value={paymentTerms}
                onChange={(event) =>
                  setPaymentTerms(event.target.value)
                }
                placeholder="e.g. Payment due within 15 days"
                className="min-h-24 border-zinc-700 bg-[#151517]"
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-[#1e1e24] text-white">
          <CardContent className="space-y-4 p-6">
            <Summary label="Subtotal" value={totals.subtotal} />

            <Summary label="Total Tax" value={totals.taxAmount} />

            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-zinc-300">
                Discount %
              </span>

              <Input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(event) =>
                  setDiscountPercent(Number(event.target.value))
                }
                className="w-24 border-zinc-700 bg-[#151517] text-right"
              />
            </div>

            <Summary
              label="Discount Amount"
              value={totals.discountAmount}
            />

            <div className="border-t border-zinc-800 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">Grand Total</span>

                <span className="text-3xl font-bold text-[#FFCC00]">
                  ₹{totals.roundedTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {formError && (
        <p className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
          {formError}
        </p>
      )}
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-xs font-bold uppercase text-zinc-400">
        {label}
      </Label>

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
    <div className="min-h-28 rounded-xl border border-zinc-800 bg-[#151517] p-4">
      <p className="text-xs font-bold uppercase text-zinc-500">
        {title}
      </p>

      <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-300">
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
    <div className="flex items-center justify-between">
      <span className="font-semibold text-zinc-300">{label}</span>
      <span className="font-bold">₹{value.toFixed(2)}</span>
    </div>
  );
}