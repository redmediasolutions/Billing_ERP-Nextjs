import { EstimateForm } from "@/features/estimates/addform/estimate-form";

export default async function EditEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EstimateForm estimateId={Number(id)} />;
}
