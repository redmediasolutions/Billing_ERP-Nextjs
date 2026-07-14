import { EstimatePreview } from "@/features/estimates/document/estimate-preview";

export default function EstimateDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  return <EstimatePreview estimateId={Number(params.id)} />;
}