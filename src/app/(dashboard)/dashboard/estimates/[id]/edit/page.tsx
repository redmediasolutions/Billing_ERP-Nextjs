import { EstimateForm } from "@/features/estimates/addform/estimate-form";

export default function EditEstimatePage({
  params,
}: {
  params: { id: string };
}) {
  return <EstimateForm estimateId={Number(params.id)} />;
}
