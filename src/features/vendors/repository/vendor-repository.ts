import { vendorService } from "../services/vendor-service";
import type { VendorInput } from "../types/vendor.types";

export const vendorRepository = {
  getAll: vendorService.getAll,

  create: (input: VendorInput) => vendorService.create(input),

  update: (id: number, input: VendorInput) =>
    vendorService.update(id, input),

  remove: (id: number) => vendorService.remove(id),
};