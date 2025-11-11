export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export function getStockStatus(qty: number): StockStatus {
  if (qty <= 0) return 'Out of Stock';
  if (qty <= 10) return 'Low Stock';
  return 'In Stock';
}
