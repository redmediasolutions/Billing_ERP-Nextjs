"use client";

import { useState } from "react";
import {
  Edit3,
  Loader2,
  PackagePlus,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  useDeleteProduct,
  useProducts,
} from "../hooks/use-products";
import type { Product } from "../types/product.types";
import { ProductForm } from "./product-form";
import styles from "../products.module.css";

export function ProductsDashboard() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const { data: products = [], isLoading, error } = useProducts(search);
  const deleteProduct = useDeleteProduct();

  function openCreate() {
    setSelectedProduct(null);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setSelectedProduct(product);
    setShowForm(true);
  }

  async function removeProduct(product: Product) {
    const confirmed = window.confirm(
      `Archive "${product.product_name}"? This cannot be done while available stock exists.`
    );

    if (!confirmed) return;

    try {
      await deleteProduct.mutateAsync(product.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to archive product."
      );
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Product catalogue</p>
          <h1>All Products</h1>
          <p className={styles.subtitle}>
            Create master products before adding individual serialised stock.
          </p>
        </div>

        <button className={styles.primaryButton} onClick={openCreate}>
          <Plus size={18} />
          Add Master Product
        </button>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <Search size={19} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product, brand, type, or code..."
          />
        </label>

        <span className={styles.resultCount}>
          {products.length} product{products.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 size={25} className={styles.spin} />
            Loading products...
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            Unable to load products. Please refresh and try again.
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <PackagePlus size={36} />
            <h3>No products found</h3>
            <p>
              Add your first master product before entering serialised stock.
            </p>
            <button className={styles.primaryButton} onClick={openCreate}>
              <Plus size={18} />
              Add First Product
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Type</th>
                  <th>Code</th>
                  <th>Available Stock</th>
                  <th className={styles.actionsColumn}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.productCell}>
                        {product.image ? (
                          <img
                            className={styles.productImage}
                            src={product.image}
                            alt={product.product_name}
                          />
                        ) : (
                          <div className={styles.productFallback}>
                            {product.product_name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <strong>{product.product_name}</strong>
                          <small>
                            {product.product_config || "No configuration"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>{product.brand_name || "—"}</td>
                    <td>{product.product_type || "—"}</td>
                    <td>{product.product_code}</td>

                    <td>
                      <span className={styles.stockBadge}>
                        {Number(product.available_stock || 0)}
                      </span>
                    </td>

                    <td className={styles.tableActions}>
                      <button
                        className={styles.iconButton}
                        onClick={() => openEdit(product)}
                        aria-label={`Edit ${product.product_name}`}
                      >
                        <Edit3 size={17} />
                      </button>

                      <button
                        className={`${styles.iconButton} ${styles.deleteButton}`}
                        disabled={deleteProduct.isPending}
                        onClick={() => removeProduct(product)}
                        aria-label={`Archive ${product.product_name}`}
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
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
        />
      ) : null}
    </section>
  );
}