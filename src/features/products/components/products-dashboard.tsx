"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { ProductFormModal } from "../addform/product-form-modal";
import { useProducts } from "../hooks/use-products";
import type { Product, ProductInput } from "../types";

export function ProductsDashboard() {
  const { products, loading, error, refresh, create, update, remove } =
    useProducts();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionError, setActionError] = useState("");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) =>
      [
        product.product_name,
        product.product_code,
        product.product_HSN || "",
        product.product_description || "",
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [products, search]);

  const withImageCount = products.filter((product) => product.image).length;
  const withHsnCount = products.filter((product) => product.product_HSN).length;

  async function saveProduct(input: ProductInput) {
    try {
      setActionError("");

      if (editingProduct) {
        await update(editingProduct.id, input);
      } else {
        await create(input);
      }

      setFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to save product."
      );
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.product_name}"? It will be archived and removed from this list.`
    );

    if (!confirmed) return;

    try {
      setActionError("");
      await remove(product.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to delete product."
      );
    }
  }

  return (
    <section className="products-dashboard">
      <div className="products-dashboard__toolbar">
        <div className="products-dashboard__search">
          <Search className="products-dashboard__search-icon" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, codes, or descriptions..."
            className="products-dashboard__search-input"
          />
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setFormOpen(true);
          }}
          className="products-dashboard__primary-action"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="products-dashboard__kpis">
        <Kpi label="Total Products" value={String(products.length)} />
        <Kpi label="With HSN Code" value={String(withHsnCount)} />
        <Kpi label="With Image" value={String(withImageCount)} />
        <Kpi
          label="Showing"
          value={String(filteredProducts.length)}
        />
      </div>

      <div className="products-dashboard__summary">
        <p className="products-dashboard__summary-label">
          Product Catalogue
        </p>

        <p className="products-dashboard__summary-copy">
          Manage your product master data, configurations, and HSN codes.
        </p>
      </div>

      <div>
        <div className="products-dashboard__directory-heading">
          <div>
            <h1 className="products-dashboard__title">Product Directory</h1>
            <p className="products-dashboard__count">
              Listing {filteredProducts.length} product
              {filteredProducts.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            onClick={() => void refresh()}
            className="products-dashboard__refresh"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {actionError && (
          <p className="products-dashboard__error">
            {actionError}
          </p>
        )}

        <div className="products-dashboard__table-card">
          <div className="products-dashboard__table-scroll">
            <table className="products-dashboard__table">
              <thead>
                <tr>
                  <th>Product Name & Code</th><th>HSN</th><th>USP</th><th>Description</th><th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="products-dashboard__state"
                    >
                      <Loader2 className="products-dashboard__spinner" />
                      Loading products...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="products-dashboard__state products-dashboard__state--error"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="products-dashboard__state"
                    >
                      No products found. Click “Add Product” to create one.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="products-dashboard__row"
                    >
                      <td><div className="products-dashboard__product">
                          <div className="products-dashboard__product-icon">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt={product.product_name}
                                className="products-dashboard__product-image"
                              />
                            ) : (
                              <Box size={20} />
                            )}
                          </div>

                          <div>
                            <p className="products-dashboard__product-name">
                              {product.product_name}
                            </p>

                            <p className="products-dashboard__product-code">
                              {product.product_code}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        {product.product_HSN || (
                          <span className="products-dashboard__empty">—</span>
                        )}
                      </td>

                      <td className="products-dashboard__usp"><p>
                          {product.product_usp || "—"}
                        </p>
                      </td>

                      <td className="products-dashboard__description"><p>
                          {product.product_description || "No description"}
                        </p>
                      </td>

                      <td><div className="products-dashboard__actions">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setFormOpen(true);
                            }}
                            className="products-dashboard__icon-action"
                            title="Edit product"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => void deleteProduct(product)}
                            className="products-dashboard__icon-action"
                            title="Archive product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {formOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setFormOpen(false);
            setEditingProduct(null);
          }}
          onSave={saveProduct}
        />
      )}
    </section>
  );
}

function Kpi({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="products-kpi">
      <Box size={20} className="products-kpi__icon" />
      <p className="products-kpi__label">{label}</p>
      <p className="products-kpi__value">{value}</p>
    </div>
  );
}
