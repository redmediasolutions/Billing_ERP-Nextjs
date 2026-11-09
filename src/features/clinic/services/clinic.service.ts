import { clinicRepository } from "../repository/clinic.repository";
import type { ClinicBillInput, ClinicDashboard, ClinicSettingsInput } from "../types";

function n(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export const clinicService = {
  settings: clinicRepository.settings,

  updateSettings: (input: ClinicSettingsInput) =>
    clinicRepository.updateSettings(input),

  async dashboard(): Promise<ClinicDashboard> {
    const data = await clinicRepository.dashboard();
    const k = data.kpi || ({} as ClinicDashboard["kpi"]);
    return {
      ...data,
      kpi: {
        patients_this_month: n(k.patients_this_month),
        patients_this_week: n(k.patients_this_week),
        total_patients: n(k.total_patients),
        income_today: n(k.income_today),
        income_week: n(k.income_week),
        income_month: n(k.income_month),
        draft_consultations: n(k.draft_consultations),
        unbilled_consultations: n(k.unbilled_consultations),
        low_stock_medicines: n(k.low_stock_medicines),
        expiring_batches: n(k.expiring_batches),
      },
      appointments: data.appointments || [],
    };
  },

  nextBillNumber: async () =>
    (await clinicRepository.nextBillNumber()).invoice_number,

  createBill: (input: ClinicBillInput) => clinicRepository.createBill(input),
};
