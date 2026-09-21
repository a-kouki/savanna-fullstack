// lib/products/verifyItems.ts
import { createClient } from '@/app/utils/supabase/server'

export type RawCartItem = {
  product_id: number
  quantity: number
  selected_size?: string        
}

export type VerifiedCartItem = {
  product_id: number
  product_name: string
  unit_price: number
  quantity: number
  selected_size?: string        
}

export type VerifyItemsResult =
  | { ok: true; items: VerifiedCartItem[] }
  | { ok: false; error: string; status: number }

/**
 * Busca o preço e nome reais de cada produto no banco, ignorando
 * qualquer unit_price/product_name vindo do client. Única fonte
 * de verdade de preço — usada por /order e por calculateDiscount.
 */
export async function verifyItems(items: RawCartItem[]): Promise<VerifyItemsResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Carrinho vazio', status: 400 }
  }

  const productIds = [...new Set(items.map((i) => i.product_id))]
  const supabase = await createClient()

  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('id, name, price, in_stock')
    .in('id', productIds)

  if (error || !dbProducts) {
    return { ok: false, error: 'Erro ao validar produtos do carrinho', status: 500 }
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]))
  const verified: VerifiedCartItem[] = []

  for (const item of items) {
    const product = productMap.get(item.product_id)
    if (!product) {
      return { ok: false, error: 'Produto não encontrado no carrinho', status: 400 }
    }
    if (!product.in_stock) {
      return { ok: false, error: `${product.name} está fora de estoque`, status: 400 }
    }
    verified.push({
      product_id: item.product_id,
      product_name: product.name,
      unit_price: product.price, 
      quantity: item.quantity,
      selected_size: item.selected_size,   
    })
  }

  return { ok: true, items: verified }
}