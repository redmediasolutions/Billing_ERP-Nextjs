import { Suspense } from "react";
import { PosItemsPageContent } from "./pos-items-page";

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="container-page">Loading items...</div>}>
      <PosItemsPageContent />
    </Suspense>
  );
}
