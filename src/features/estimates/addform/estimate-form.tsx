"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, FileText, Loader2, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ItemPickerDialog } from "./item-picker-dialog";
import {
  useCreateEstimate,
  useCustomers,
} from "../hooks/use-estimates";
import type {
  CatalogItem,
  Customer,
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

export function EstimateForm() {
  const router = useRouter();
  const createEstimate = useCreateEstimate();
  const { data: customers = [], isLoading: loadingCustomers } =
    useCustomers();

  const [customerId, setCustomerId] = useState("");
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

  const selectedCustomer = customers.find(
    (customer) => customer.id === Number(customerId)
  );

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

  function addCatalogItem(item: CatalogItem) {
    setLineItems((current) => {
      const existing = current.find(
        (line) => line.item_id === item.id
      );

      if (existing) {
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
        custom_billing_address:
          selectedCustomer?.customer_billing_address || "",
        custom_delivery_address:
          selectedCustomer?.customer_shipping_address || "",
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

      await createEstimate.mutateAsync(payload);

      router.push("/dashboard/estimates");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save estimate."
      );
    }
  }

  return (
    <section className="estimate-form">
      <div className="estimate-form__header">
        <div className="estimate-form__title-group">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/estimates")}
            className="estimate-form__back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="estimate-form__title">Create Estimate</h1>
        </div>

        <div className="estimate-form__actions">
          <Button
            variant="outline"
            onClick={() => void saveEstimate(true)}
            disabled={createEstimate.isPending}
            className="estimate-form__secondary-action"
          >
            Save Draft
          </Button>

          <Button
            onClick={() => void saveEstimate(false)}
            disabled={createEstimate.isPending}
            className="estimate-form__primary-action"
          >
            {createEstimate.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Finalize Estimate
          </Button>
        </div>
      </div>

      <div className="estimate-form__grid">
        <Card className="estimate-form__section">
          <CardContent>
            <h2 className="estimate-form__section-title">
              <UserRound />
              Customer Info
            </h2>

            <Field label="Select Customer *">
              <select
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className="employee-form__select"
              >
                <option value="">
                  {loadingCustomers
                    ? "Loading customers..."
                    : "Select a customer"}
                </option>

                {customers.map((customer: Customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name}
                    {customer.customer_phone
                      ? ` · ${customer.customer_phone}`
                      : ""}
                  </option>
                ))}
              </select>
            </Field>

            <div className="form-grid form-grid--2col" style={{ marginTop: 20 }}>
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

        <Card className="estimate-form__section">
          <CardContent>
            <h2 className="estimate-form__section-title">
              <FileText />
              Estimate Details
            </h2>

            <div className="form-grid form-grid--2col">
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

            <div style={{ marginTop: 20 }}>
              <Field label="Project Notes">
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Internal notes or project brief..."
                />
              </Field>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="line-items">
        <div className="line-items__header">
          <h2 className="line-items__title">Line Items</h2>

          <ItemPickerDialog onSelect={addCatalogItem} />
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
                    Click &ldquo;Add Items&rdquo; to select an item from your catalogue.
                  </td>
                </tr>
              ) : (
                lineItems.map((line) => (
                  <tr key={line.id} className="line-items__row">
                    <td>
                      <p className="line-items__name">{line.item_name}</p>
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
                        type="button"
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

      <div className="estimate-form__grid" style={{ marginTop: 24 }}>
        <Card className="estimate-form__section">
          <CardContent>
            <Field label="Payment Terms">
              <Textarea
                value={paymentTerms}
                onChange={(event) =>
                  setPaymentTerms(event.target.value)
                }
                placeholder="e.g. Payment due within 15 days"
              />
            </Field>

            <div style={{ marginTop: 20 }}>
              <Field label="Transfer Information">
                <Textarea
                  value={transferInformation}
                  onChange={(event) =>
                    setTransferInformation(event.target.value)
                  }
                  placeholder="Bank details or transfer instructions..."
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="estimate-form__section">
          <CardContent style={{ display: "grid", gap: 16 }}>
            <div className="summary-panel__row">
              <span className="summary-panel__label">Subtotal</span>
              <span className="summary-panel__value">
                ₹{totals.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="summary-panel__row">
              <span className="summary-panel__label">Total Tax</span>
              <span className="summary-panel__value">
                ₹{totals.totalTax.toFixed(2)}
              </span>
            </div>

            <div className="summary-panel__row">
              <span className="summary-panel__label">Discount %</span>

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

            <div className="summary-panel__row">
              <span className="summary-panel__label">Total Discount</span>
              <span className="summary-panel__value">
                ₹{totals.totalDiscount.toFixed(2)}
              </span>
            </div>

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
      <Label className="form-field__label">{label}</Label>
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
      <p className="address-card__title">{title}</p>
      <p className="address-card__value">
        {value || "Select a customer to populate address"}
      </p>
    </div>
  );
}