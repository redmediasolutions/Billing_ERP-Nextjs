"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import type { Product, ProductInput } from "../types";

const emptyProduct: ProductInput = {
  product_name: "",
  product_config: "",
  product_description: "",
  product_HSN: "",
  image: null,
  product_usp: "",
};

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (input: ProductInput) => Promise<void>;
}

export function ProductFormModal({
  product,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const [form, setForm] = useState<ProductInput>(
    product
      ? {
          product_name: product.product_name,
          product_config: product.product_config || "",
          product_description: product.product_description || "",
          product_HSN: product.product_HSN || "",
          image: product.image,
          product_usp: product.product_usp || "",
        }
      : emptyProduct
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof ProductInput>(
    field: K,
    value: ProductInput[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.product_name.trim()) {
      setError("Product name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSave({
        ...form,
        product_name: form.product_name.trim(),
        product_config: form.product_config.trim(),
        product_description: form.product_description.trim(),
        product_HSN: form.product_HSN.trim(),
        product_usp: form.product_usp.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="product-form-overlay">
      <form onSubmit={handleSubmit} className="product-form">
        <div className="product-form__header">
          <h2 className="product-form__title">
            {product ? "Edit Product" : "Add New Product"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="product-form__close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="product-form__grid">
          <Field label="Product Name *" className="product-form__field--full">
            <input
              autoFocus
              value={form.product_name}
              onChange={(event) =>
                updateField("product_name", event.target.value)
              }
              placeholder="e.g. Anwy Paracetamol 500mg"
            />
          </Field>

          <Field label="Product Code" className="product-form__field--half">
            <input
              disabled
              value={product?.product_code || "Auto-generated"}
            />
          </Field>

          <Field label="HSN Code" className="product-form__field--half">
            <input
              value={form.product_HSN}
              onChange={(event) =>
                updateField("product_HSN", event.target.value)
              }
              placeholder="e.g. 998313"
            />
          </Field>

          <Field label="Configuration" className="product-form__field--full">
            <textarea
              rows={3}
              value={form.product_config}
              onChange={(event) =>
                updateField("product_config", event.target.value)
              }
              placeholder="Optional specs / configuration details..."
            />
          </Field>

          <Field label="USP" className="product-form__field--full">
            <input
              value={form.product_usp}
              onChange={(event) =>
                updateField("product_usp", event.target.value)
              }
              placeholder="Unique selling point"
            />
          </Field>

          <Field label="Image URL" className="product-form__field--full">
            <input
              value={form.image || ""}
              onChange={(event) =>
                updateField("image", event.target.value || null)
              }
              placeholder="Optional image URL"
            />
          </Field>

          <Field label="Product Description" className="product-form__field--full">
            <textarea
              rows={3}
              value={form.product_description}
              onChange={(event) =>
                updateField("product_description", event.target.value)
              }
              placeholder="Optional details about the product..."
            />
          </Field>

          {error && (
            <p className="form-error product-form__field--full">{error}</p>
          )}
        </div>

        <div className="product-form__footer">
          <button
            type="button"
            onClick={onClose}
            className="product-form__cancel"
          >
            Cancel
          </button>

          <button disabled={saving} className="product-form__submit">
            {saving
              ? "Saving..."
              : product
                ? "Save Changes"
                : "Add Product"}
          </button>
        </div>
      </form>
    </div>
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
    <label className={`form-field product-form__field ${className}`}>
      <span className="form-field__label">{label}</span>
      <div>{children}</div>
    </label>
  );
}
