"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import "./toast.css";

type ToastKind = "success" | "error" | "info";
interface ToastItem { id: number; kind: ToastKind; message: string; }

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            {t.kind === "success" && <CheckCircle2 size={16} />}
            {t.kind === "error" && <XCircle size={16} />}
            {t.kind === "info" && <Info size={16} />}
            <span>{t.message}</span>
            <button onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))} aria-label="Dismiss">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
