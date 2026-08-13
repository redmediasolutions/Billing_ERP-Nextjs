"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Item } from "@/features/items/types";
import { customersService } from "@/features/customers/services/customers.service";
import { checkStockAvailability } from "@/features/inventory/lib/stock-validation";
import type { StockCheckResult } from "@/features/inventory/lib/stock-validation";
import type { CartLine, SalesChannel } from "@/features/pos/types";
import { priceFor } from "@/features/pos/lib/pricing";

interface CartContextValue {
  channel: SalesChannel;
  setChannel: (c: SalesChannel) => void;
  lines: CartLine[];
  addItem: (item: Item) => StockCheckResult;
  increase: (itemId: number) => StockCheckResult;
  decrease: (itemId: number) => void;
  removeItem: (itemId: number) => void;
  clear: () => void;
  customerId: number | null;
  customerLoading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [channel, setChannel] = useState<SalesChannel>("walk_in");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerLoading, setCustomerLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setCustomerLoading(true);
    customersService
      .getWalkIn()
      .then((customer) => {
        if (!active) return;
        setCustomerId(customer.id);
      })
      .catch(() => {
        if (!active) return;
        setCustomerId(null);
      })
      .finally(() => {
        if (active) setCustomerLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addItem = useCallback((item: Item): StockCheckResult => {
    let result: StockCheckResult = { ok: true };

    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      const nextQty = existing ? existing.quantity + 1 : 1;
      const check = checkStockAvailability(item, nextQty);

      if (!check.ok) {
        result = check;
        return prev;
      }

      if (existing) {
        return prev.map((l) =>
          l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }

      return [...prev, { item, quantity: 1 }];
    });

    return result;
  }, []);

  const increase = useCallback((itemId: number): StockCheckResult => {
    let result: StockCheckResult = { ok: true };

    setLines((prev) => {
      const line = prev.find((l) => l.item.id === itemId);
      if (!line) return prev;

      const check = checkStockAvailability(line.item, line.quantity + 1);
      if (!check.ok) {
        result = check;
        return prev;
      }

      return prev.map((l) =>
        l.item.id === itemId ? { ...l, quantity: l.quantity + 1 } : l
      );
    });

    return result;
  }, []);

  const decrease = useCallback((itemId: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.item.id === itemId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((itemId: number) => {
    setLines((prev) => prev.filter((l) => l.item.id !== itemId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
  }, []);

  const value = useMemo(
    () => ({
      channel,
      setChannel,
      lines,
      addItem,
      increase,
      decrease,
      removeItem,
      clear,
      customerId,
      customerLoading,
    }),
    [channel, lines, addItem, increase, decrease, removeItem, clear, customerId, customerLoading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { priceFor };

export function useCartTotals() {
  const { lines, channel } = useCart();
  return useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    const rows = lines.map((l) => {
      const unitPrice = priceFor(l.item, channel);
      const amount = unitPrice * l.quantity;
      const lineTax = (amount * (Number(l.item.tax_rate) || 0)) / 100;
      subtotal += amount;
      tax += lineTax;
      return { ...l, unitPrice, amount, tax: lineTax, total: amount + lineTax };
    });
    return { rows, subtotal, tax, total: subtotal + tax, totalQuantity: lines.reduce((s, l) => s + l.quantity, 0) };
  }, [lines, channel]);
}
