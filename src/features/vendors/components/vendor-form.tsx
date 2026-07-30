"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import {
  useCreateVendor,
  useUpdateVendor,
} from "../hooks/use-vendors";
import type { Vendor, VendorInput } from "../types/vendor.types";
import styles from "../vendors.module.css";

const emptyVendor: VendorInput = {
  vendor_name: "",
  vendor_phone: "",
  vendor_email: "",
  vendor_logo: "",
  vendor_address: "",
  is_local_vendor: false,
};

export function VendorForm({
  vendor,
  onClose,
}: {
  vendor?: Vendor | null;
  onClose: () => void;
}) {
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();

  const [form, setForm] = useState<VendorInput>(emptyVendor);
  const [formError, setFormError] = useState("");

  const isEditing = Boolean(vendor);
  const isSaving = createVendor.isPending || updateVendor.isPending;

  useEffect(() => {
    if (!vendor) {
      setForm(emptyVendor);
      return;
    }

    setForm({
      vendor_name: vendor.vendor_name || "",
      vendor_phone: vendor.vendor_phone || "",
      vendor_email: vendor.vendor_email || "",
      vendor_logo: vendor.vendor_logo || "",
      vendor_address: vendor.vendor_address || "",
      is_local_vendor: Boolean(vendor.is_local_vendor),
    });
  }, [vendor]);

  function updateField(
    field: keyof VendorInput,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.vendor_name.trim()) {
      setFormError("Vendor name is required.");
      return;
    }

    try {
      if (vendor) {
        await updateVendor.mutateAsync({
          id: vendor.id,
          input: form,
        });
      } else {
        await createVendor.mutateAsync(form);
      }

      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save vendor."
      );
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>Purchase management</p>
            <h2>{isEditing ? "Edit Vendor" : "Add Vendor"}</h2>
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
            <span>Vendor Name *</span>
            <input
              value={form.vendor_name}
              onChange={(event) =>
                updateField("vendor_name", event.target.value)
              }
              placeholder="e.g. Tech Distributors India"
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span>Phone Number</span>
            <input
              value={form.vendor_phone}
              onChange={(event) =>
                updateField("vendor_phone", event.target.value)
              }
              placeholder="e.g. 9876543210"
            />
          </label>

          <label className={styles.field}>
            <span>Email Address</span>
            <input
              type="email"
              value={form.vendor_email}
              onChange={(event) =>
                updateField("vendor_email", event.target.value)
              }
              placeholder="vendor@example.com"
            />
          </label>

          <label className={styles.field}>
            <span>Vendor Logo URL</span>
            <input
              value={form.vendor_logo}
              onChange={(event) =>
                updateField("vendor_logo", event.target.value)
              }
              placeholder="https://..."
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Address</span>
            <textarea
              rows={4}
              value={form.vendor_address}
              onChange={(event) =>
                updateField("vendor_address", event.target.value)
              }
              placeholder="Vendor billing or office address"
            />
          </label>

          <label className={`${styles.checkField} ${styles.fullWidth}`}>
            <input
              type="checkbox"
              checked={form.is_local_vendor}
              onChange={(event) =>
                updateField(
                  "is_local_vendor",
                  event.target.checked
                )
              }
            />
            <span>
              Local Vendor
              <small>
                Mark this for nearby or walk-in purchase vendors.
              </small>
            </span>
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
            {isEditing ? "Save Changes" : "Save Vendor"}
          </button>
        </div>
      </form>
    </div>
  );
}