"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, Printer, X } from "lucide-react";
import { Button } from "@/features/pos/ui/button";
import { money } from "@/features/pos/lib/money";
import { useCart, useCartTotals } from "../hooks/useCart";
import { ChannelToggle } from "./ChannelToggle";
import { generateInvoiceNumber } from "@/features/pos/lib/invoices";
import { invoicesService } from "@/features/invoices/services/invoices.service";
import type { InvoiceInput } from "@/features/invoices/types";
import { useToast } from "@/features/pos/ui/toast";
import "./CartPanel.css";

export function CartContents({ onClose }: { onClose?: () => void }) {
  const { lines, increase, decrease, removeItem, clear, channel, customerId, customerLoading } = useCart();
  const { rows, subtotal, tax, total, totalQuantity } = useCartTotals();
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const checkoutDisabled = rows.length === 0 || customerLoading || !customerId || submitting;

  async function checkout() {
    if (!customerId) {
      toast.error("Still preparing the bill — please try again in a moment");
      return;
    }
    if (rows.length === 0) return;

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const payload: InvoiceInput = {
        invoice_number: generateInvoiceNumber(channel === "cloud_kitchen" ? "CK" : "WI"),
        customer_id: customerId,
        custom_billing_address: "Walk-in Customer",
        custom_delivery_address: "",
        invoice_date: today,
        due_date: today,
        payment_terms: "Paid at counter",
        subtotal,
        discount_amount: 0,
        tax_amount: tax,
        grand_total: total,
        rounded_total: Math.round(total),
        notes: "",
        order_type: channel === "cloud_kitchen" ? "cloud_kitchen" : "counter",
        table_name: "",
        is_draft: false,
        sales_channel: channel,
        line_items: rows.map((r) => ({
          id: String(r.item.id),
          item_id: r.item.id,
          batch_id: null,
          item_name: r.item.item_name,
          hsn_code: r.item.hsn_code ?? "",
          unit: r.item.unit ?? "",
          description: "",
          quantity: r.quantity,
          unit_price: r.unitPrice,
          amount_before_tax: r.amount,
          tax_rate: Number(r.item.tax_rate) || 0,
          tax_amount: r.tax,
          line_discount: 0,
          line_total: r.total,
        })),
      };

      const invoice = await invoicesService.create(payload);
      toast.success(`Bill ${invoice.invoice_number} generated`);
      clear();
      onClose?.();
      router.push(`/dashboard/pos/invoices/${invoice.id}?print=1`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate bill");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cart-contents">
      {onClose && <div className="cart-sheet-handle" aria-hidden />}

      <div className="cart-panel-head">
        <div className="cart-panel-head-row">
          <span className="eyebrow">Current bill</span>
          <div className="cart-panel-head-actions">
            {lines.length > 0 && (
              <button className="cart-clear" onClick={clear} type="button">
                <Trash2 size={12} /> Clear
              </button>
            )}
            {onClose && (
              <button className="cart-close" onClick={onClose} type="button" aria-label="Close bill">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <ChannelToggle />
      </div>

      <div className="cart-lines scroll-y">
        {rows.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 16px" }}>
            <div className="empty-state-icon"><ShoppingCart size={18} /></div>
            <div className="empty-state-title">Bill is empty</div>
            <p className="text-sm">Tap an item to add it to the current bill.</p>
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.item.id} className="cart-line">
              <div className="cart-line-info">
                <div className="text-sm font-medium truncate">{r.item.item_name}</div>
                <div className="text-xs text-faint mono">{money(r.unitPrice)} · {r.item.unit}</div>
              </div>
              <div className="cart-line-qty">
                <button type="button" onClick={() => decrease(r.item.id)} aria-label="Decrease"><Minus size={13} /></button>
                <span className="mono">{r.quantity}</span>
                <button type="button" onClick={() => increase(r.item.id)} aria-label="Increase"><Plus size={13} /></button>
              </div>
              <div className="cart-line-total amount">{money(r.total)}</div>
              <button type="button" className="cart-line-remove" onClick={() => removeItem(r.item.id)} aria-label="Remove">
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="cart-panel-foot">
        <div className="cart-total-row"><span className="text-muted">Subtotal ({totalQuantity} item{totalQuantity === 1 ? "" : "s"})</span><span className="mono">{money(subtotal)}</span></div>
        <div className="cart-total-row"><span className="text-muted">Tax</span><span className="mono">{money(tax)}</span></div>
        <div className="cart-total-row cart-total-grand"><span>Total</span><span className="amount">{money(total)}</span></div>
        <Button
          size="lg"
          className="w-full cart-checkout-btn"
          disabled={checkoutDisabled}
          loading={submitting || customerLoading}
          onClick={checkout}
        >
          <Printer size={16} /> Generate &amp; print bill
        </Button>
      </div>
    </div>
  );
}

export function CartPanel() {
  return (
    <aside className="cart-panel">
      <CartContents />
    </aside>
  );
}
