import { medicinesRepository } from "../repository/medicines.repository";
import type { Medicine, MedicineBatch, MedicineDetail } from "../types";

const n = (v: unknown) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

const normalize = <T extends Medicine>(m: T): T => ({
  ...m,
  tax_rate: n(m.tax_rate),
  default_price: n(m.default_price),
  selling_price: n(m.selling_price),
  total_stock: n(m.total_stock),
  batch_count: n(m.batch_count),
});

const normalizeBatch = (b: MedicineBatch): MedicineBatch => ({
  ...b,
  quantity: n(b.quantity),
  purchase_price: n(b.purchase_price),
  selling_price: n(b.selling_price),
  no_expiry: Boolean(b.no_expiry),
});

export const medicinesService = {
  list: async () => (await medicinesRepository.list()).map(normalize),

  async getById(id: number): Promise<MedicineDetail> {
    const m = await medicinesRepository.getById(id);
    return { ...normalize(m), batches: (m.batches || []).map(normalizeBatch) };
  },

  availableBatches: async (medicineId?: number) =>
    (await medicinesRepository.availableBatches(medicineId)).map(normalizeBatch),

  create: medicinesRepository.create,
  update: medicinesRepository.update,
  archive: medicinesRepository.archive,
  addBatch: medicinesRepository.addBatch,
  updateBatch: medicinesRepository.updateBatch,
  adjustStock: medicinesRepository.adjustStock,
};
