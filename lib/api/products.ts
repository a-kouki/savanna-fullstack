import type { ProductSummary } from '@/app/types/products';

export async function fetchAllProducts(): Promise<ProductSummary[]> {
  const res = await fetch('/api/admin/products?minimal=true');
  if (!res.ok) throw new Error('Erro ao carregar produtos');
  return res.json();
}