"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Edit3,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";

import {
  useBrands,
  useDeleteBrand,
} from "../hooks/use-brands";
import type { Brand } from "../types/brand.types";
import { BrandForm } from "./brand-form";
import styles from "../brands.module.css";

export function BrandsDashboard() {
  const searchParams = useSearchParams();
  const { data: brands = [], isLoading, error } = useBrands();
  const deleteBrand = useDeleteBrand();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedBrand, setSelectedBrand] =
    useState<Brand | null>(null);

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return brands;

    return brands.filter((brand) => {
      return [
        brand.name,
        brand.description,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [brands, search]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setSelectedBrand(null);
      setShowForm(true);
    }
  }, [searchParams]);

  function openCreate() {
    setSelectedBrand(null);
    setShowForm(true);
  }

  function openEdit(brand: Brand) {
    setSelectedBrand(brand);
    setShowForm(true);
  }

  async function removeBrand(brand: Brand) {
    const confirmed = window.confirm(
      `Archive "${brand.name}"? Products already linked to this brand will not be deleted.`
    );

    if (!confirmed) return;

    try {
      await deleteBrand.mutateAsync(brand.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to archive brand."
      );
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Product catalogue</p>
          <h1>Brands</h1>
          <p className={styles.subtitle}>
            Create and manage the brands used by your product
            catalogue.
          </p>
        </div>

        <button
          className={styles.primaryButton}
          onClick={openCreate}
        >
          <Plus size={18} />
          Add Brand
        </button>
      </header>

      <div className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <span>Total Brands</span>
          <strong>{brands.length}</strong>
          <Tag size={22} />
        </article>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <Search size={19} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search brands..."
          />
        </label>

        <span className={styles.resultCount}>
          {filteredBrands.length} brand
          {filteredBrands.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 size={25} className={styles.spin} />
            Loading brands...
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            Unable to load brands. Please refresh and try again.
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className={styles.emptyState}>
            <Tag size={34} />
            <h3>No brands found</h3>
            <p>
              Create a brand before adding products to your
              catalogue.
            </p>
            <button
              className={styles.primaryButton}
              onClick={openCreate}
            >
              <Plus size={18} />
              Add First Brand
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th className={styles.actionsColumn}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <div className={styles.brandCell}>
                        {brand.brand_logo ? (
                          <img
                            src={brand.brand_logo}
                            alt={`${brand.name} logo`}
                            className={styles.brandLogo}
                          />
                        ) : (
                          <div className={styles.brandFallback}>
                            {brand.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <strong>{brand.name}</strong>
                      </div>
                    </td>

                    <td className={styles.descriptionCell}>
                      {brand.description || "No description"}
                    </td>

                    <td>
                      {new Date(
                        brand.created_at
                      ).toLocaleDateString("en-IN")}
                    </td>

                    <td className={styles.tableActions}>
                      <button
                        className={styles.iconButton}
                        onClick={() => openEdit(brand)}
                        aria-label={`Edit ${brand.name}`}
                      >
                        <Edit3 size={17} />
                      </button>

                      <button
                        className={`${styles.iconButton} ${styles.deleteButton}`}
                        onClick={() => removeBrand(brand)}
                        disabled={deleteBrand.isPending}
                        aria-label={`Delete ${brand.name}`}
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

      {showForm && (
        <BrandForm
          brand={selectedBrand}
          onClose={() => {
            setShowForm(false);
            setSelectedBrand(null);
          }}
        />
      )}
    </section>
  );
}