import { brandService } from "../services/brand-service";
import type { BrandInput } from "../types/brand.types";

export const brandRepository = {
  getAll: brandService.getAll,

  create: (input: BrandInput) => brandService.create(input),

  update: (id: number, input: BrandInput) =>
    brandService.update(id, input),

  remove: (id: number) => brandService.remove(id),
};