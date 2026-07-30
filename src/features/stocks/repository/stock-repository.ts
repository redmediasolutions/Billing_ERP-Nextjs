import { stockService } from "../services/stock-service";
import type {
  SellStockInput,
  StockInput,
  StockUpdateInput,
} from "../types/stock.types";

export const stockRepository = {
  getAll: (search?: string, status?: string) =>
    stockService.getAll(search, status),

  generateSerial: stockService.generateSerial,
  getCustomers: stockService.getCustomers,

  create: (input: StockInput) => stockService.create(input),

  update: (id: number, input: StockUpdateInput) =>
    stockService.update(id, input),

  sell: (id: number, input: SellStockInput) =>
    stockService.sell(id, input),

  remove: (id: number) => stockService.remove(id),
};