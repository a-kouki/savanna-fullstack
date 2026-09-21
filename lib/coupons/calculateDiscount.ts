// lib/coupons/calculateDiscount.ts
import { createClient } from '@/app/utils/supabase/server';
import { verifyItems } from '../products/verifyItems';

export type CalculateDiscountItem = {
  product_id: number;
  quantity: number;
  unit_price: number;
};

export type CalculateDiscountResult =
  | {
      ok: true;
      coupon_id: string;
      code: string;
      type: 'percentage' | 'fixed' | 'free_shipping';
      scope: 'all' | 'products' | 'categories';
      discount_amount: number;
      free_shipping: boolean;
      eligible_product_ids: number[];
      cart_subtotal: number;
      eligible_subtotal: number;
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

//Valida um código de cupom contra um carrinho + cliente, e calcula o desconto.
export async function calculateDiscount(
  code: string,
  phone: string,
  email: string | null | undefined,
  rawItems: CalculateDiscountItem[],
): Promise<CalculateDiscountResult> {
  if (!code?.trim()) {
    return { ok: false, error: 'Informe o código do cupom', status: 400 };
  }
  if (!phone?.trim()) {
    return { ok: false, error: 'Telefone é obrigatório', status: 400 };
  }
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, error: 'Carrinho vazio', status: 400 };
  }

  const verification = await verifyItems(rawItems)
  if (!verification.ok) return verification 
  const items = verification.items
  const supabase = await createClient();

  // 1) Busca o cupom pelo código
  const { data: coupon, error: couponError } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .single();

  if (couponError || !coupon) {
    return { ok: false, error: 'Cupom não encontrado', status: 404 };
  }

  if (!coupon.active) {
    return { ok: false, error: 'Este cupom não está mais ativo', status: 400 };
  }

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { ok: false, error: 'Este cupom ainda não é válido', status: 400 };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { ok: false, error: 'Este cupom expirou', status: 400 };
  }

  // 2) Limites de uso, total e por cliente (telefone OU email)
  if (coupon.usage_limit_total !== null) {
    const { count: totalCount } = await supabase
      .from('coupon_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id);

    if ((totalCount ?? 0) >= coupon.usage_limit_total) {
      return { ok: false, error: 'Este cupom atingiu o limite de usos', status: 400 };
    }
  }

  if (coupon.usage_limit_per_customer !== null) {
    let customerQuery = supabase
      .from('coupon_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id);

    const orFilters = [`customer_phone.eq.${phone.trim()}`];
    if (email?.trim()) orFilters.push(`customer_email.eq.${email.trim()}`);
    customerQuery = customerQuery.or(orFilters.join(','));

    const { count: customerCount } = await customerQuery;

    if ((customerCount ?? 0) >= coupon.usage_limit_per_customer) {
      return {
        ok: false,
        error: 'Você já utilizou este cupom o número máximo de vezes',
        status: 400,
      };
    }
  }

  // 3) Resolve categoria de cada produto do carrinho
  const productIds = items.map((i) => i.product_id);

  const { data: productCategories } = await supabase
    .from('product_categories')
    .select('product_id, category_id')
    .in('product_id', productIds);

  const categoryByProduct = new Map<number, string>();
  for (const pc of productCategories ?? []) {
    categoryByProduct.set(pc.product_id, pc.category_id);
  }

  // 4) Determina itens elegíveis conforme o escopo do cupom
  let eligibleProductIds: Set<number>;

  if (coupon.scope === 'all') {
    eligibleProductIds = new Set(productIds);
  } else if (coupon.scope === 'products') {
    const { data: couponProducts } = await supabase
      .from('coupon_products')
      .select('product_id')
      .eq('coupon_id', coupon.id);

    const allowedIds = new Set((couponProducts ?? []).map((p) => p.product_id));
    eligibleProductIds = new Set(productIds.filter((id) => allowedIds.has(id)));
  } else {
    const { data: couponCategories } = await supabase
      .from('coupon_categories')
      .select('category_id')
      .eq('coupon_id', coupon.id);

    const allowedCategoryIds = new Set((couponCategories ?? []).map((c) => c.category_id));
    eligibleProductIds = new Set(
      productIds.filter((id) => {
        const catId = categoryByProduct.get(id);
        return catId ? allowedCategoryIds.has(catId) : false;
      }),
    );
  }

  if (eligibleProductIds.size === 0) {
    return {
      ok: false,
      error: 'Este cupom não é aplicável aos itens do seu carrinho',
      status: 400,
    };
  }

  // 5) Calcula subtotais
  const cartSubtotal = items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);
  const eligibleSubtotal = items
    .filter((i) => eligibleProductIds.has(i.product_id))
    .reduce((acc, i) => acc + i.unit_price * i.quantity, 0);

  if (coupon.min_order_value !== null && cartSubtotal < coupon.min_order_value) {
    return {
      ok: false,
      error: `Pedido mínimo de R$ ${Number(coupon.min_order_value).toFixed(2)} para usar este cupom`,
      status: 400,
    };
  }

  // 6) Calcula o desconto
  let discountAmount = 0;
  let freeShipping = false;

  if (coupon.type === 'percentage') {
    discountAmount = eligibleSubtotal * (Number(coupon.value) / 100);
    if (coupon.max_discount_value !== null) {
      discountAmount = Math.min(discountAmount, Number(coupon.max_discount_value));
    }
  } else if (coupon.type === 'fixed') {
    discountAmount = Math.min(Number(coupon.value), eligibleSubtotal);
  } else if (coupon.type === 'free_shipping') {
    freeShipping = true;
    discountAmount = 0;
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    ok: true,
    coupon_id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    scope: coupon.scope,
    discount_amount: discountAmount,
    free_shipping: freeShipping,
    eligible_product_ids: Array.from(eligibleProductIds),
    cart_subtotal: cartSubtotal,
    eligible_subtotal: eligibleSubtotal,
  };
}