"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import { useBrands } from "@/features/brands/hooks/use-brands";
import {
  useCreateProduct,
  useUpdateProduct,
} from "../hooks/use-products";
import type {
  Product,
  ProductInput,
} from "../types/product.types";
import styles from "../products.module.css";

const emptyProduct: ProductInput = {
  brand_id: null,
  product_type: "",
  product_name: "",
  product_code: "",
  product_config: "",
  product_description: "",
  product_HSN: "",
  image: "",
  product_usp: "",
};

export function ProductForm({
  product,
  onClose,
}: {
  product?: Product | null;
  onClose: () => void;
}) {
  const { data: brands = [], isLoading: isLoadingBrands } = useBrands();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState<ProductInput>(emptyProduct);
  const [formError, setFormError] = useState("");

  const isEditing = Boolean(product);
  const isSaving = createProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (!product) {
      setForm(emptyProduct);
      return;
    }

    setForm({
      brand_id: product.brand_id,
      product_type: product.product_type || "",
      product_name: product.product_name || "",
      product_code: product.product_code || "",
      product_config: product.product_config || "",
      product_description: product.product_description || "",
      product_HSN: product.product_HSN || "",
      image: product.image || "",
      product_usp: product.product_usp || "",
    });
  }, [product]);

  function updateField(
    field: keyof ProductInput,
    value: string | number | null
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (
      !form.brand_id ||
      !form.product_type.trim() ||
      !form.product_name.trim() ||
      !form.product_code.trim()
    ) {
      setFormError("Brand, type, product name, and product code are required.");
      return;
    }

    try {
      if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          input: form,
        });
      } else {
        await createProduct.mutateAsync(form);
      }

      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save product."
      );
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>Product catalogue</p>
            <h2>
              {isEditing ? "Edit Product" : "Add Master Product"}
            </h2>
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

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Product Type *</span>
            <select
              value={form.product_type}
              onChange={(event) =>
                updateField("product_type", event.target.value)
              }
            >
              <option value="">Select product type</option>
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="All-in-One">All-in-One</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Accessory">Accessory</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Brand *</span>
            <select
              value={form.brand_id ?? ""}
              onChange={(event) =>
                updateField(
                  "brand_id",
                  event.target.value
                    ? Number(event.target.value)
                    : null
                )
              }
              disabled={isLoadingBrands}
            >
              <option value="">
                {isLoadingBrands
                  ? "Loading brands..."
                  : "Select brand"}
              </option>

              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Product Name *</span>
            <input
              value={form.product_name}
              onChange={(event) =>
                updateField("product_name", event.target.value)
              }
              placeholder="e.g. HP ProBook 440 G7"
            />
          </label>

          <label className={styles.field}>
            <span>Product Code *</span>
            <input
              value={form.product_code}
              onChange={(event) =>
                updateField("product_code", event.target.value)
              }
              placeholder="e.g. HP-PB-440-G7"
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Configuration</span>
            <input
              value={form.product_config}
              onChange={(event) =>
                updateField("product_config", event.target.value)
              }
              placeholder="e.g. Core i5 10th / 16GB RAM / 512GB SSD"
            />
          </label>

          <label className={styles.field}>
            <span>HSN Code</span>
            <input
              value={form.product_HSN}
              onChange={(event) =>
                updateField("product_HSN", event.target.value)
              }
              placeholder="e.g. 84713010"
            />
          </label>

          <label className={styles.field}>
            <span>Image URL</span>
            <input
              value={form.image}
              onChange={(event) =>
                updateField("image", event.target.value)
              }
              placeholder="https://..."
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Description</span>
            <textarea
              rows={4}
              value={form.product_description}
              onChange={(event) =>
                updateField("product_description", event.target.value)
              }
              placeholder="Optional product description"
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Unique Selling Points</span>
            <textarea
              rows={3}
              value={form.product_usp}
              onChange={(event) =>
                updateField("product_usp", event.target.value)
              }
              placeholder="Warranty, specifications, included accessories..."
            />
          </label>
        </div>

        {formError ? (
          <p className={styles.formError}>{formError}</p>
        ) : null}

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

            {isEditing ? "Save Changes" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}