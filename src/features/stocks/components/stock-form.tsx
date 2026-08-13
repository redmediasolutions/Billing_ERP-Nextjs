"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, RefreshCw, X } from "lucide-react";

import { CreatableSelect } from "@/components/forms/creatable-select";
import { ProductForm } from "@/features/products/components/product-form";
import { useProducts } from "@/features/products/hooks/use-products";
import {
  useCreateVendor,
  useVendors,
} from "@/features/vendors/hooks/use-vendors";
import { stockService } from "../services/stock-service";
import {
  useCreateStock,
  useUpdateStock,
} from "../hooks/use-stocks";
import type {
  Stock,
  StockInput,
  StockUpdateInput,
} from "../types/stock.types";
import styles from "../stocks.module.css";

const today = new Date().toISOString().slice(0, 10);

const emptyForm: StockInput = {
  product_id: null,
  vendor_id: null,
  purchase_date: today,
  stock_cost: "",
  sale_price: "",
  item_condition: "A+",
  narration: "",
  serials: [""],
};

export function StockForm({
  stock,
  onClose,
}: {
  stock?: Stock | null;
  onClose: () => void;
}) {
  const { data: products = [] } = useProducts();
  const { data: vendors = [] } = useVendors();
  const createVendor = useCreateVendor();

  const createStock = useCreateStock();
  const updateStock = useUpdateStock();

  const [form, setForm] = useState<StockInput>(emptyForm);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  const isEditing = Boolean(stock);
  const isSaving =
    createStock.isPending || updateStock.isPending || createVendor.isPending;

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.product_name} — ${product.product_code}`,
  }));

  const vendorOptions = vendors.map((vendor) => ({
    value: vendor.id,
    label: vendor.vendor_name,
  }));

  async function handleCreateVendor(name: string) {
    const result = await createVendor.mutateAsync({
      vendor_name: name,
      vendor_phone: "",
      vendor_email: "",
      vendor_logo: "",
      vendor_address: "",
      is_local_vendor: true,
    });
    return { value: result.id, label: name };
  }

  useEffect(() => {
    if (!stock) {
      setForm(emptyForm);
      return;
    }

    setForm({
      product_id: stock.product_id,
      vendor_id: stock.vendor_id,
      purchase_date: stock.purchase_date?.slice(0, 10) || today,
      stock_cost: String(stock.stock_cost || ""),
      sale_price: String(stock.sale_price || ""),
      item_condition: stock.item_condition || "A+",
      narration: stock.stock_narration || "",
      serials: [stock.product_serial],
    });
  }, [stock]);

  function setField<K extends keyof StockInput>(
    field: K,
    value: StockInput[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function changeQuantity(quantity: number) {
    const safeQuantity = Math.min(Math.max(quantity, 1), 50);

    setForm((current) => ({
      ...current,
      serials: Array.from(
        { length: safeQuantity },
        (_, index) => current.serials[index] || ""
      ),
    }));
  }

  function updateSerial(index: number, value: string) {
    setForm((current) => ({
      ...current,
      serials: current.serials.map((serial, serialIndex) =>
        serialIndex === index ? value : serial
      ),
    }));
  }

  async function generateSerials() {
    setGenerating(true);
    setError("");

    try {
      const generated = await Promise.all(
        form.serials.map(async () => {
          const response = await stockService.generateSerial();
          return response.serial;
        })
      );

      setField("serials", generated);
    } catch {
      setError("Unable to generate serial numbers.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.product_id) {
      setError("Please select a product.");
      return;
    }

    if (!form.serials.every((serial) => serial.trim())) {
      setError("Every stock item requires a serial number.");
      return;
    }

    try {
      if (stock) {
        const updateInput: StockUpdateInput = {
          vendor_id: form.vendor_id,
          product_serial: form.serials[0].trim(),
          stock_cost: form.stock_cost,
          sale_price: form.sale_price,
          item_condition: form.item_condition,
          narration: form.narration,
        };

        await updateStock.mutateAsync({
          id: stock.id,
          input: updateInput,
        });
      } else {
        await createStock.mutateAsync({
          ...form,
          serials: form.serials.map((serial) => serial.trim()),
        });
      }

      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save stock."
      );
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>Inventory management</p>
            <h2>{isEditing ? "Edit Stock" : "Add Stock"}</h2>
          </div>

          <button
            className={styles.iconButton}
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className={styles.formGrid}>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Product *</span>
            <CreatableSelect
              value={form.product_id}
              options={productOptions}
              onChange={(value) =>
                setField(
                  "product_id",
                  value === null ? null : Number(value)
                )
              }
              placeholder="Select product"
              disabled={isEditing}
              emptyLabel="No products yet"
            />
            {!isEditing ? (
              <button
                type="button"
                className={styles.textButton}
                onClick={() => setShowProductForm(true)}
              >
                <Plus size={15} />
                Create new product
              </button>
            ) : null}
          </label>

          <label className={styles.field}>
            <span>Vendor</span>
            <CreatableSelect
              value={form.vendor_id}
              options={vendorOptions}
              onChange={(value) =>
                setField(
                  "vendor_id",
                  value === null ? null : Number(value)
                )
              }
              onCreate={handleCreateVendor}
              placeholder="No vendor selected"
              emptyLabel="No vendors yet — create one below"
            />
          </label>

          <label className={styles.field}>
            <span>Purchase Date *</span>
            <input
              type="date"
              value={form.purchase_date}
              disabled={isEditing}
              onChange={(event) =>
                setField("purchase_date", event.target.value)
              }
            />
          </label>

          <label className={styles.field}>
            <span>Cost Price (₹) *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.stock_cost}
              onChange={(event) =>
                setField("stock_cost", event.target.value)
              }
              placeholder="0.00"
            />
          </label>

          <label className={styles.field}>
            <span>Default Sale Price (₹) *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.sale_price}
              onChange={(event) =>
                setField("sale_price", event.target.value)
              }
              placeholder="0.00"
            />
          </label>

          <label className={styles.field}>
            <span>Condition</span>
            <select
              value={form.item_condition}
              onChange={(event) =>
                setField("item_condition", event.target.value)
              }
            >
              <option value="New">New</option>
              <option value="A++">A++</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="Refurbished">Refurbished</option>
            </select>
          </label>

          {!isEditing ? (
            <label className={styles.field}>
              <span>Quantity *</span>
              <input
                type="number"
                min="1"
                max="50"
                value={form.serials.length}
                onChange={(event) =>
                  changeQuantity(Number(event.target.value || 1))
                }
              />
            </label>
          ) : null}

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>
              {isEditing
                ? "Serial Number *"
                : "Serial Numbers *"}
            </span>

            <div className={styles.serialHeading}>
              <small>
                One physical device must have one unique serial.
              </small>

              {!isEditing ? (
                <button
                  className={styles.textButton}
                  type="button"
                  onClick={generateSerials}
                  disabled={generating}
                >
                  <RefreshCw
                    size={15}
                    className={generating ? styles.spin : ""}
                  />
                  Generate Random Serials
                </button>
              ) : null}
            </div>

            <div className={styles.serialList}>
              {form.serials.map((serial, index) => (
                <input
                  key={index}
                  value={serial}
                  onChange={(event) =>
                    updateSerial(index, event.target.value)
                  }
                  placeholder={`Serial ${index + 1}`}
                />
              ))}
            </div>
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Purchase Notes</span>
            <textarea
              rows={3}
              value={form.narration}
              onChange={(event) =>
                setField("narration", event.target.value)
              }
              placeholder="Optional purchase or stock notes"
            />
          </label>
        </div>

        {error ? <p className={styles.formError}>{error}</p> : null}

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 size={18} className={styles.spin} />
            ) : null}
            {isEditing ? "Save Changes" : "Save Stock"}
          </button>
        </div>
      </form>

      {showProductForm ? (
        <ProductForm
          onClose={() => setShowProductForm(false)}
          onCreated={(id) => {
            setField("product_id", id);
            setShowProductForm(false);
          }}
        />
      ) : null}
    </div>
  );
}