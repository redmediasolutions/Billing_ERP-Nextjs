import { consultationsRepository } from "../repository/consultations.repository";
import type { Consultation, ConsultationDetail } from "../types";

const n = (v: unknown) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

export function normalizeConsultation(c: Consultation): Consultation {
  return {
    ...c,
    consultation_fee: n(c.consultation_fee),
    invoice_total: n(c.invoice_total),
    invoice_paid: n(c.invoice_paid),
    is_archived: Boolean(c.is_archived),
    status: c.status === "completed" ? "completed" : "draft",
  };
}

export const consultationsService = {
  async list(params: Parameters<typeof consultationsRepository.list>[0] = {}) {
    return (await consultationsRepository.list(params)).map(normalizeConsultation);
  },

  async getById(id: number): Promise<ConsultationDetail> {
    const d = await consultationsRepository.getById(id);
    return {
      ...d,
      consultation: normalizeConsultation(d.consultation),
      procedures: (d.procedures || []).map((p) => ({
        ...p,
        quantity: n(p.quantity) || 1,
        price: n(p.price),
        total: n(p.total),
      })),
      vitals: d.vitals || [],
      prescriptions: d.prescriptions || [],
      attachments: d.attachments || [],
      followup_notes: d.followup_notes || [],
      followups: d.followups || [],
    };
  },

  async start(input: { patient_id: number; appointment_id?: number | null }) {
    const r = await consultationsRepository.start(input);
    return { ...r, consultation: normalizeConsultation(r.consultation) };
  },

  /** Browser -> S3 upload with a presigned URL, then save the attachment row. */
  async uploadAttachment(id: number, file: File, title: string) {
    const contentType = file.type || "application/octet-stream";
    const { uploadUrl, fileKey } = await consultationsRepository.uploadUrl(id, {
      fileName: file.name,
      contentType,
    });
    const put = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file,
    });
    if (!put.ok) {
      throw new Error("Upload to storage failed. Check the S3 bucket CORS settings.");
    }
    return consultationsRepository.saveAttachment(id, {
      file_key: fileKey,
      file_type: contentType.startsWith("image/") ? "image" : "document",
      title: title || file.name,
    });
  },

  update: consultationsRepository.update,
  saveVitals: consultationsRepository.saveVitals,
  addProcedure: consultationsRepository.addProcedure,
  deleteProcedure: consultationsRepository.deleteProcedure,
  addPrescription: consultationsRepository.addPrescription,
  deletePrescription: consultationsRepository.deletePrescription,
  addFollowup: consultationsRepository.addFollowup,
  setState: consultationsRepository.setState,
  generateBill: consultationsRepository.generateBill,
  deleteAttachment: consultationsRepository.deleteAttachment,
  viewUrl: consultationsRepository.viewUrl,
};
