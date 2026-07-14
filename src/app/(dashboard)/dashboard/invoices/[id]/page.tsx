import { InvoicePreview } from "@/features/invoices/document/invoice-preview";

export default function InvoiceDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  return <InvoicePreview invoiceId={Number(params.id)} />;
}