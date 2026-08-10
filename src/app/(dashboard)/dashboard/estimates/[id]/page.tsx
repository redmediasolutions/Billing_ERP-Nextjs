import { EstimatePreview } from "@/features/estimates/document/estimate-preview";

export default async function EstimateDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EstimatePreview estimateId={Number(id)} />;
}
