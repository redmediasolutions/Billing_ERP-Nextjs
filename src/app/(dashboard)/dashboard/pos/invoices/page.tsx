import { Suspense } from "react";
import { PosInvoicesPageContent } from "./pos-invoices-page";

export default function InvoicesListPage() {
  return (
    <Suspense fallback={<div className="container-page">Loading invoices...</div>}>
      <PosInvoicesPageContent />
    </Suspense>
  );
}
