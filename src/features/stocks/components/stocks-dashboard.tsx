"use client";

import { useMemo, useState } from "react";
import {
  Edit3,
  Loader2,
  PackagePlus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import {
  useDeleteStock,
  useStocks,
} from "../hooks/use-stocks";
import type { Stock } from "../types/stock.types";
import { SellStockDialog } from "./sell-stock-dialog";
import { StockForm } from "./stock-form";
import styles from "../stocks.module.css";

function money(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function StocksDashboard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [sellingStock, setSellingStock] = useState<Stock | null>(null);

  const { data: stocks = [], isLoading, error } = useStocks(search, status);
  const deleteStock = useDeleteStock();

  const summary = useMemo(
    () => ({
      total: stocks.length,
      available: stocks.filter((item) => item.status === "available").length,
      sold: stocks.filter((item) => item.status === "sold").length,
    }),
    [stocks]
  );

  function openAdd() {
    setEditingStock(null);
    setShowForm(true);
  }

  function openEdit(stock: Stock) {
    setEditingStock(stock);
    setShowForm(true);
  }

  async function archiveStock(stock: Stock) {
    const confirmed = window.confirm(
      `Archive stock serial "${stock.product_serial}"?`
    );

    if (!confirmed) return;

    try {
      await deleteStock.mutateAsync(stock.id);
    } catch (requestError) {
      window.alert(
        requestError instanceof Error
          ? requestError.message
          : "Unable to archive stock."
      );
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Inventory management</p>
          <h1>Stocks</h1>
          <p className={styles.subtitle}>
            Track every physical device by its unique serial number.
          </p>
        </div>

        <button className={styles.primaryButton} onClick={openAdd}>
          <Plus size={18} />
          Add Stock
        </button>
      </header>

      <div className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <span>Total Stock Records</span>
          <strong>{summary.total}</strong>
          <PackagePlus size={22} />
        </article>

        <article className={styles.kpiCard}>
          <span>Available Devices</span>
          <strong>{summary.available}</strong>
          <PackagePlus size={22} />
        </article>

        <article className={styles.kpiCard}>
          <span>Sold Devices</span>
          <strong>{summary.sold}</strong>
          <ShoppingCart size={22} />
        </article>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <Search size={19} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product, vendor, or serial..."
          />
        </label>

        <select
          className={styles.filterSelect}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All stock</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 size={25} className={styles.spin} />
            Loading stock...
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            Unable to load stock. Please refresh and try again.
          </div>
        ) : stocks.length === 0 ? (
          <div className={styles.emptyState}>
            <PackagePlus size={36} />
            <h3>No stock found</h3>
            <p>
              Add products and vendors first, then add physical stock devices.
            </p>
            <button className={styles.primaryButton} onClick={openAdd}>
              <Plus size={18} />
              Add First Stock
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Serial</th>
                  <th>Vendor</th>
                  <th>Cost</th>
                  <th>Sale Price</th>
                  <th>Condition</th>
                  <th>Purchase Date</th>
                  <th>Status</th>
                  <th className={styles.actionsColumn}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.id}>
                    <td>
                      <div className={styles.productCell}>
                        {stock.product_image ? (
                          <img
                            className={styles.productImage}
                            src={stock.product_image}
                            alt={stock.product_name}
                          />
                        ) : (
                          <div className={styles.productFallback}>
                            {stock.product_name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <strong>{stock.product_name}</strong>
                          <small>
                            {stock.product_config || stock.stock_code || "—"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>{stock.product_serial}</td>
                    <td>{stock.vendor_name || "—"}</td>
                    <td>{money(stock.stock_cost)}</td>
                    <td>{money(stock.sale_price)}</td>
                    <td>{stock.item_condition || "—"}</td>

                    <td>
                      {stock.purchase_date
                        ? new Date(
                            stock.purchase_date
                          ).toLocaleDateString("en-IN")
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          stock.status === "available"
                            ? styles.availableBadge
                            : stock.status === "sold"
                              ? styles.soldBadge
                              : styles.archivedBadge
                        }`}
                      >
                        {stock.status}
                      </span>
                    </td>

                    <td className={styles.tableActions}>
                      {stock.status === "available" ? (
                        <>
                          <button
                            className={styles.iconButton}
                            onClick={() => openEdit(stock)}
                            aria-label="Edit stock"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            className={styles.iconButton}
                            onClick={() => setSellingStock(stock)}
                            aria-label="Sell stock"
                          >
                            <ShoppingCart size={17} />
                          </button>

                          <button
                            className={`${styles.iconButton} ${styles.deleteButton}`}
                            onClick={() => archiveStock(stock)}
                            disabled={deleteStock.isPending}
                            aria-label="Archive stock"
                          >
                            <Trash2 size={17} />
                          </button>
                        </>
                      ) : stock.invoice_id ? (
                        <a
                          className={styles.invoiceLink}
                          href={`/dashboard/invoices/${stock.invoice_id}`}
                        >
                          {stock.invoice_number || "Invoice"}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm ? (
        <StockForm
          stock={editingStock}
          onClose={() => {
            setShowForm(false);
            setEditingStock(null);
          }}
        />
      ) : null}

      {sellingStock ? (
        <SellStockDialog
          stock={sellingStock}
          onClose={() => setSellingStock(null)}
        />
      ) : null}
    </section>
  );
}