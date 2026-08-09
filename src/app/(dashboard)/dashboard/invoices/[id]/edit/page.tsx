import { InvoiceForm } from "@/features/invoices/addform/invoice-form";

export default function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  return <InvoiceForm invoiceId={Number(params.id)} />;
}
