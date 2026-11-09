import { ClinicGuard } from "@/features/clinic/components/clinic-guard";
import { ConsultationWorkspace } from "@/features/consultations/components/consultation-workspace";

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ClinicGuard>
      <ConsultationWorkspace consultationId={Number(id)} />
    </ClinicGuard>
  );
}
