import { productsRepository } from "../repository/products.repository";
import type { Product, ProductInput } from "../types";

function normalizeProduct(product: Product): Product {
  return {
    ...product,

    // MariaDB may return 0 / 1 or "0" / "1".
    is_archived: Number(product.is_archived) === 1,
  };
}

export const productsService = {
  async list(search?: string) {
    const products = await productsRepository.list(search);
    return products.map(normalizeProduct);
  },

  async create(input: ProductInput) {
    const product = await productsRepository.create(input);
    return normalizeProduct(product);
  },

  async update(id: number, input: ProductInput) {
    const product = await productsRepository.update(id, input);
    return normalizeProduct(product);
  },

  remove: (id: number) => productsRepository.remove(id),
};
