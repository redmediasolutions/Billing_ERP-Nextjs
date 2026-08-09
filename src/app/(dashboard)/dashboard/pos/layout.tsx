import { CartProvider } from "@/features/pos/invoices/hooks/useCart";
import { MobileTabBar } from "@/features/pos/layout/MobileTabBar";
import { ToastProvider } from "@/features/pos/ui/toast";
import "@/features/pos/pos-base.css";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <div className="pos-shell">{children}</div>
        <MobileTabBar />
      </CartProvider>
    </ToastProvider>
  );
}
