import { productService } from "../services/product-service";
import type { ProductInput } from "../types/product.types";

export const productRepository = {
  getAll: (search?: string) => productService.getAll(search),

  create: (input: ProductInput) => productService.create(input),

  update: (id: number, input: ProductInput) =>
    productService.update(id, input),

  remove: (id: number) => productService.remove(id),
};