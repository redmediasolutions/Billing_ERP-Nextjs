"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import {
  useCreateBrand,
  useUpdateBrand,
} from "../hooks/use-brands";
import type { Brand, BrandInput } from "../types/brand.types";
import styles from "../brands.module.css";

const emptyBrand: BrandInput = {
  name: "",
  description: "",
  brand_logo: "",
  cover_image: "",
};

interface BrandFormProps {
  brand?: Brand | null;
  onClose: () => void;
}

export function BrandForm({
  brand,
  onClose,
}: BrandFormProps) {
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const [form, setForm] = useState<BrandInput>(emptyBrand);
  const [formError, setFormError] = useState("");

  const isEditing = Boolean(brand);
  const isSaving = createBrand.isPending || updateBrand.isPending;

  useEffect(() => {
    if (!brand) {
      setForm(emptyBrand);
      return;
    }

    setForm({
      name: brand.name || "",
      description: brand.description || "",
      brand_logo: brand.brand_logo || "",
      cover_image: brand.cover_image || "",
    });
  }, [brand]);

  function updateField(
    field: keyof BrandInput,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Brand name is required.");
      return;
    }

    try {
      if (brand) {
        await updateBrand.mutateAsync({
          id: brand.id,
          input: form,
        });
      } else {
        await createBrand.mutateAsync(form);
      }

      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save brand."
      );
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <form
        className={styles.modal}
        onSubmit={handleSubmit}
      >
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>
              Product catalogue
            </p>
            <h2>
              {isEditing ? "Edit Brand" : "Add Brand"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={styles.iconButton}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Brand Name *</span>
            <input
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              placeholder="e.g. Lenovo"
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span>Brand Logo URL</span>
            <input
              value={form.brand_logo}
              onChange={(event) =>
                updateField("brand_logo", event.target.value)
              }
              placeholder="https://..."
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Cover Image URL</span>
            <input
              value={form.cover_image}
              onChange={(event) =>
                updateField("cover_image", event.target.value)
              }
              placeholder="https://..."
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Optional information about this brand"
              rows={4}
            />
          </label>
        </div>

        {formError && (
          <p className={styles.formError}>{formError}</p>
        )}

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

            {isEditing ? "Save Changes" : "Save Brand"}
          </button>
        </div>
      </form>
    </div>
  );
}