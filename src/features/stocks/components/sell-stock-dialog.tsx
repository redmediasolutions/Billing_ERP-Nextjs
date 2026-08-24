"use client";

import { FormEvent, useEffect, useState } from "react";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  useSellStock,
  useStockCustomers,
} from "../hooks/use-stocks";
import type {
  SellStockInput,
  Stock,
} from "../types/stock.types";
import styles from "../stocks.module.css";
import { customerDisplayName } from "@/features/customers/customer-display";

export function SellStockDialog({
  stock,
  onClose,
}: {
  stock: Stock;
  onClose: () => void;
}) {
  const router = useRouter();
  const { data: customers = [], isLoading } = useStockCustomers();
  const sellStock = useSellStock();

  const [form, setForm] = useState<SellStockInput>({
    customer_id: null,
    sale_price: String(stock.sale_price || ""),
    tax_rate: "0",
    notes: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      customer_id: null,
      sale_price: String(stock.sale_price || ""),
      tax_rate: "0",
      notes: "",
    });
  }, [stock]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.customer_id) {
      setError("Please select a customer.");
      return;
    }

    if (Number(form.sale_price) <= 0) {
      setError("Enter a valid sale price.");
      return;
    }

    try {
      const result = await sellStock.mutateAsync({
        id: stock.id,
        input: form,
      });

      onClose();

      router.push(`/dashboard/invoices/${result.invoice_id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sell stock."
      );
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.smallModal} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>Stock sale</p>
            <h2>Sell Stock</h2>
          </div>

          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className={styles.saleProduct}>
          <strong>{stock.product_name}</strong>
          <span>
            Serial: {stock.product_serial} · {stock.item_condition || "—"}
          </span>
        </div>

        <div className={styles.formGrid}>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Customer *</span>
            <select
              value={form.customer_id ?? ""}
              disabled={isLoading}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  customer_id: event.target.value
                    ? Number(event.target.value)
                    : null,
                }))
              }
            >
              <option value="">
                {isLoading
                  ? "Loading customers..."
                  : "Select customer"}
              </option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customerDisplayName(customer)}
                  {customer.customer_phone
                    ? ` — ${customer.customer_phone}`
                    : ""}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Sale Price (₹) *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.sale_price}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sale_price: event.target.value,
                }))
              }
            />
          </label>

          <label className={styles.field}>
            <span>Tax Rate (%)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.tax_rate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  tax_rate: event.target.value,
                }))
              }
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Invoice Notes</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="Optional invoice notes"
            />
          </label>
        </div>

        {error ? <p className={styles.formError}>{error}</p> : null}

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={sellStock.isPending}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={sellStock.isPending}
          >
            {sellStock.isPending ? (
              <Loader2 size={18} className={styles.spin} />
            ) : (
              <ExternalLink size={18} />
            )}
            Confirm Sale & Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
