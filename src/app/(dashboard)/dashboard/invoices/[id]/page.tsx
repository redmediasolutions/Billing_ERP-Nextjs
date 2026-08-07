// src/app/(dashboard)/dashboard/invoices/[id]/page.tsx

import { InvoicePreview } from "@/features/invoices/document/invoice-preview";

export default async function InvoiceDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InvoicePreview invoiceId={Number(id)} />;
}
