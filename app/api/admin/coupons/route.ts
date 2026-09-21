//  /api/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'
//import { requireAdminSession } from '@/lib/auth/require-admin-session';
import type { CouponFormInput } from '@/lib/types/coupon';
import { adminActionRateLimit } from '@/app/utils/redis';


// Lista todos os cupons + contagem de resgates
export async function GET(request: NextRequest) {
  //const authError = await requireAdminSession(request);
  //if (authError) return authError;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!coupons?.length) {
    return NextResponse.json({ coupons: [] });
  }

  const { data: redemptions } = await supabase
    .from('coupon_redemptions')
    .select('coupon_id');

  const countByCoupon = new Map<string, number>();
  for (const r of redemptions ?? []) {
    countByCoupon.set(r.coupon_id, (countByCoupon.get(r.coupon_id) ?? 0) + 1);
  }

  // busca vínculos de produtos/categorias de todos os cupons de uma vez
  // (evita N+1 — uma query só, depois agrupa em memória)
  const { data: productLinks } = await supabase
    .from('coupon_products')
    .select('coupon_id, product:products(id, name)');

  const { data: categoryLinks } = await supabase
    .from('coupon_categories')
    .select('coupon_id, category:categories(id, name)');

  const productsByCoupon = new Map<string, { id: number; name: string }[]>();
  for (const l of (productLinks ?? []) as any[]) {
    const list = productsByCoupon.get(l.coupon_id) ?? [];
    if (l.product) list.push(l.product);
    productsByCoupon.set(l.coupon_id, list);
  }

  const categoriesByCoupon = new Map<string, { id: string; name: string }[]>();
  for (const l of (categoryLinks ?? []) as any[]) {
    const list = categoriesByCoupon.get(l.coupon_id) ?? [];
    if (l.category) list.push(l.category);
    categoriesByCoupon.set(l.coupon_id, list);
  }

  const withCounts = coupons.map((c) => ({
    ...c,
    total_redemptions: countByCoupon.get(c.id) ?? 0,
    products: productsByCoupon.get(c.id) ?? [],
    categories: categoriesByCoupon.get(c.id) ?? [],
  }));

  return NextResponse.json({ coupons: withCounts });
}

// Cria um novo cupom
export async function POST(request: NextRequest) {
  //const authError = await requireAdminSession(request);
  //if (authError) return authError;
  const supabase = await createClient();const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const body: CouponFormInput = await request.json();

  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 });
  }
  if (body.type !== 'free_shipping' && (!body.value || body.value <= 0)) {
    return NextResponse.json({ error: 'Valor de desconto inválido' }, { status: 400 });
  }
  if (body.type === 'percentage' && body.value! > 100) {
    return NextResponse.json({ error: 'Percentual não pode passar de 100%' }, { status: 400 });
  }

  // validação de escopo
  const scope = body.scope ?? 'all';
  if (!['all', 'products', 'categories'].includes(scope)) {
    return NextResponse.json({ error: 'Escopo inválido' }, { status: 400 });
  }
  if (scope === 'products' && (!body.product_ids || body.product_ids.length === 0)) {
    return NextResponse.json(
      { error: 'Selecione pelo menos um produto para este cupom' },
      { status: 400 },
    );
  }
  if (scope === 'categories' && (!body.category_ids || body.category_ids.length === 0)) {
    return NextResponse.json(
      { error: 'Selecione pelo menos uma categoria para este cupom' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: body.code.trim().toUpperCase(),
      description: body.description?.trim() || null,
      type: body.type,
      value: body.type === 'free_shipping' ? null : body.value,
      min_order_value: body.min_order_value ?? null,
      max_discount_value: body.max_discount_value ?? null,
      usage_limit_total: body.usage_limit_total ?? null,
      usage_limit_per_customer: body.usage_limit_per_customer ?? 1,
      starts_at: body.starts_at || null,
      expires_at: body.expires_at || null,
      active: body.active,
      scope, 
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe um cupom com esse código' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (scope === 'products' && body.product_ids?.length) {
    const { error: linkError } = await supabase
      .from('coupon_products')
      .insert(body.product_ids.map((product_id) => ({ coupon_id: data.id, product_id })));

    if (linkError) {
      return NextResponse.json(
        { error: 'Cupom criado, mas falhou ao vincular produtos: ' + linkError.message },
        { status: 207 },
      );
    }
  }

  if (scope === 'categories' && body.category_ids?.length) {
    const { error: linkError } = await supabase
      .from('coupon_categories')
      .insert(body.category_ids.map((category_id) => ({ coupon_id: data.id, category_id })));

    if (linkError) {
      return NextResponse.json(
        { error: 'Cupom criado, mas falhou ao vincular categorias: ' + linkError.message },
        { status: 207 },
      );
    }
  }

  return NextResponse.json({ coupon: data }, { status: 201 });
}