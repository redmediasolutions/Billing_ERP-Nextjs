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
    <section className="invoice-form">
      <div className="invoice-form__header">
        <div className="invoice-form__title-group">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/invoices")}
            className="invoice-form__back"
          >
            <ArrowLeft size={20} />
          </Button>

          <h1 className="invoice-form__title">Create Invoice</h1>
        </div>

        <div className="invoice-form__header-actions">
          <Button
            variant="outline"
            disabled={createInvoice.isPending}
            onClick={() => void saveInvoice(true)}
            className="invoice-form__secondary-action"
          >
            Save Draft
          </Button>

          <Button
            disabled={createInvoice.isPending}
            onClick={() => void saveInvoice(false)}
            className="invoice-form__primary-action"
          >
            {createInvoice.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}

            Finalize Invoice
          </Button>
        </div>
      </div>

      <div className="invoice-form__details-grid">
        <Card className="invoice-form__section">
          <CardContent className="invoice-form__section-content">
            <h2 className="invoice-form__section-title">
              <UserRound size={20} />
              Customer Info
            </h2>

            <Field label="Select Customer *">
              <select
                value={customerId}
                onChange={(event) =>
                  setCustomerId(event.target.value)
                }
                className="employee-form__select"
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

            <div className="form-grid form-grid--2col" style={{ marginTop: 20 }}>
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

        <Card className="invoice-form__section">
          <CardContent className="invoice-form__section-content">
            <h2 className="invoice-form__section-title">
              <FileText size={20} />
              Invoice Details
            </h2>

            <div className="form-grid form-grid--2col">
              <Field label="Invoice Number *">
                <Input
                  value={invoiceNumber}
                  onChange={(event) =>
                    setInvoiceNumber(event.target.value)
                  }
                />
              </Field>

              <Field label="Order Type">
                <select
                  value={orderType}
                  onChange={(event) =>
                    setOrderType(event.target.value)
                  }
                  className="employee-form__select"
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
                />
              </Field>

              <Field label="Due Date">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                />
              </Field>

              <Field label="Table Name">
                <Input
                  value={tableName}
                  onChange={(event) =>
                    setTableName(event.target.value)
                  }
                  placeholder="Optional"
                />
              </Field>
            </div>

            <div style={{ marginTop: 20 }}>
              <Field label="Notes">
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Invoice notes..."
                />
              </Field>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="line-items">
        <div className="line-items__header">
          <h2 className="line-items__title">Line Items</h2>

          <ItemPickerDialog onSelect={addItem} />
        </div>

        <div className="line-items__table-scroll">
          <table className="line-items__table">
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="line-items__empty">
                    Click &ldquo;Add Items&rdquo; to choose catalogue items.
                  </td>
                </tr>
              ) : (
                lineItems.map((line) => (
                  <tr key={line.id} className="line-items__row">
                    <td>
                      <p className="line-items__name">
                        {line.item_name}
                      </p>

                      <p className="line-items__meta">
                        {line.unit} · HSN: {line.hsn_code || "—"}
                      </p>
                    </td>

                    <td>
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
                        className="line-items__input--qty"
                      />
                    </td>

                    <td>
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
                        className="line-items__input--rate"
                      />
                    </td>

                    <td>
                      <Input
                        type="number"
                        min="0"
                        value={line.tax_rate}
                        onChange={(event) =>
                          updateLine(line.id, {
                            tax_rate: Number(event.target.value),
                          })
                        }
                        className="line-items__input--tax"
                      />
                    </td>

                    <td>
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
                        className="line-items__input--discount"
                      />
                    </td>

                    <td className="line-items__amount">
                      ₹{line.line_total.toFixed(2)}
                    </td>

                    <td>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(line.id)}
                        className="line-items__delete"
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
      </div>

      <div className="invoice-form__details-grid" style={{ marginTop: 24 }}>
        <Card className="invoice-form__section">
          <CardContent className="invoice-form__section-content">
            <Field label="Payment Terms">
              <Textarea
                value={paymentTerms}
                onChange={(event) =>
                  setPaymentTerms(event.target.value)
                }
                placeholder="e.g. Payment due within 15 days"
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="invoice-form__section">
          <CardContent className="invoice-form__section-content" style={{ display: "grid", gap: 16 }}>
            <Summary label="Subtotal" value={totals.subtotal} />

            <Summary label="Total Tax" value={totals.taxAmount} />

            <div className="summary-panel__row">
              <span className="summary-panel__label">
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
                className="summary-panel__discount-input"
              />
            </div>

            <Summary
              label="Discount Amount"
              value={totals.discountAmount}
            />

            <div className="summary-panel__total">
              <span className="summary-panel__total-label">Grand Total</span>

              <span className="summary-panel__total-value">
                ₹{totals.roundedTotal.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {formError && (
        <p className="form-error" style={{ marginTop: 24 }}>
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
    <div className="form-field">
      <Label className="form-field__label">
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
    <div className="address-card">
      <p className="address-card__title">
        {title}
      </p>

      <p className="address-card__value">
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
    <div className="summary-panel__row">
      <span className="summary-panel__label">{label}</span>
      <span className="summary-panel__value">₹{value.toFixed(2)}</span>
    </div>
  );
}