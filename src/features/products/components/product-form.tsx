"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import { useBrands, useCreateBrand } from "@/features/brands/hooks/use-brands";
import {
  CreatableCombobox,
  CreatableSelect,
} from "@/components/forms/creatable-select";
import {
  useCreateProduct,
  useProducts,
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
  onCreated,
}: {
  product?: Product | null;
  onClose: () => void;
  onCreated?: (id: number) => void;
}) {
  const { data: brands = [], isLoading: isLoadingBrands } = useBrands();
  const createBrand = useCreateBrand();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [form, setForm] = useState<ProductInput>(emptyProduct);
  const [formError, setFormError] = useState("");

  const isEditing = Boolean(product);
  const isSaving =
    createProduct.isPending ||
    updateProduct.isPending ||
    createBrand.isPending;

  const brandOptions = brands.map((brand) => ({
    value: brand.id,
    label: brand.name,
  }));

  const { data: allProducts = [] } = useProducts();
  const productTypeSuggestions = Array.from(
    new Set(
      allProducts
        .map((item) => item.product_type?.trim())
        .filter((type): type is string => Boolean(type))
    )
  );

  async function handleCreateBrand(name: string) {
    const result = await createBrand.mutateAsync({
      name,
      description: "",
      brand_logo: "",
      cover_image: "",
    });
    return { value: result.id, label: name };
  }

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
        const result = await createProduct.mutateAsync(form);
        onCreated?.(result.id);
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
            <CreatableCombobox
              value={form.product_type}
              onChange={(value) => updateField("product_type", value)}
              suggestions={productTypeSuggestions}
              placeholder="Type or pick a product type"
              inputClassName=""
            />
            <small className="text-xs text-muted-foreground">
              Type a new category or pick from suggestions.
            </small>
          </label>

          <label className={styles.field}>
            <span>Brand *</span>
            <CreatableSelect
              value={form.brand_id}
              options={brandOptions}
              onChange={(value) =>
                updateField(
                  "brand_id",
                  value === null ? null : Number(value)
                )
              }
              onCreate={handleCreateBrand}
              loading={isLoadingBrands}
              placeholder="Select brand"
              emptyLabel="No brands yet — create one below"
            />
            <small className="text-xs text-muted-foreground">
              Don&apos;t see your brand? Choose &quot;+ Create new...&quot;
            </small>
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