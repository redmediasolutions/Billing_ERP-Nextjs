"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Edit3,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";

import {
  useDeleteVendor,
  useVendors,
} from "../hooks/use-vendors";
import type { Vendor } from "../types/vendor.types";
import { VendorForm } from "./vendor-form";
import styles from "../vendors.module.css";

export function VendorsDashboard() {
  const searchParams = useSearchParams();
  const { data: vendors = [], isLoading, error } = useVendors();
  const deleteVendor = useDeleteVendor();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedVendor, setSelectedVendor] =
    useState<Vendor | null>(null);

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return vendors;

    return vendors.filter((vendor) =>
      [
        vendor.vendor_name,
        vendor.vendor_phone,
        vendor.vendor_email,
        vendor.vendor_address,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [search, vendors]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setSelectedVendor(null);
      setShowForm(true);
    }
  }, [searchParams]);

  function openCreate() {
    setSelectedVendor(null);
    setShowForm(true);
  }

  function openEdit(vendor: Vendor) {
    setSelectedVendor(vendor);
    setShowForm(true);
  }

  async function removeVendor(vendor: Vendor) {
    const confirmed = window.confirm(
      `Archive "${vendor.vendor_name}"? Existing stock and purchase records will remain available.`
    );

    if (!confirmed) return;

    try {
      await deleteVendor.mutateAsync(vendor.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to archive vendor."
      );
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Purchase management</p>
          <h1>Vendors</h1>
          <p className={styles.subtitle}>
            Manage your suppliers and local purchase vendors.
          </p>
        </div>

        <button className={styles.primaryButton} onClick={openCreate}>
          <Plus size={18} />
          Add Vendor
        </button>
      </header>

      <div className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <span>Total Vendors</span>
          <strong>{vendors.length}</strong>
          <Truck size={22} />
        </article>

        <article className={styles.kpiCard}>
          <span>Local Vendors</span>
          <strong>
            {
              vendors.filter((vendor) =>
                Boolean(vendor.is_local_vendor)
              ).length
            }
          </strong>
          <MapPin size={22} />
        </article>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <Search size={19} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search vendors, phone, or email..."
          />
        </label>

        <span className={styles.resultCount}>
          {filteredVendors.length} vendor
          {filteredVendors.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 size={25} className={styles.spin} />
            Loading vendors...
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            Unable to load vendors. Please refresh and try again.
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className={styles.emptyState}>
            <Truck size={34} />
            <h3>No vendors found</h3>
            <p>
              Add vendors before creating purchase and stock records.
            </p>
            <button
              className={styles.primaryButton}
              onClick={openCreate}
            >
              <Plus size={18} />
              Add First Vendor
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th className={styles.actionsColumn}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div className={styles.vendorCell}>
                        {vendor.vendor_logo ? (
                          <img
                            src={vendor.vendor_logo}
                            alt={`${vendor.vendor_name} logo`}
                            className={styles.vendorLogo}
                          />
                        ) : (
                          <div className={styles.vendorFallback}>
                            {vendor.vendor_name
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <strong>{vendor.vendor_name}</strong>
                      </div>
                    </td>

                    <td>
                      <div className={styles.contactCell}>
                        <span>{vendor.vendor_phone || "—"}</span>
                        <small>{vendor.vendor_email || "—"}</small>
                      </div>
                    </td>

                    <td className={styles.addressCell}>
                      {vendor.vendor_address || "—"}
                    </td>

                    <td>
                      <span className={styles.statusBadge}>
                        {vendor.is_local_vendor
                          ? "Local"
                          : "External"}
                      </span>
                    </td>

                    <td className={styles.tableActions}>
                      <button
                        className={styles.iconButton}
                        onClick={() => openEdit(vendor)}
                        aria-label={`Edit ${vendor.vendor_name}`}
                      >
                        <Edit3 size={17} />
                      </button>

                      <button
                        className={`${styles.iconButton} ${styles.deleteButton}`}
                        onClick={() => removeVendor(vendor)}
                        disabled={deleteVendor.isPending}
                        aria-label={`Delete ${vendor.vendor_name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm ? (
        <VendorForm
          vendor={selectedVendor}
          onClose={() => {
            setShowForm(false);
            setSelectedVendor(null);
          }}
        />
      ) : null}
    </section>
  );
}