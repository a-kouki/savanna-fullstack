//  /api/coupons/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'
//import { requireAdminSession } from '@/lib/auth/require-admin-session';
import type { CouponFormInput } from '@/lib/types/coupon';
import { adminActionRateLimit } from '@/app/utils/redis';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Next.js 15 — params é Promise
) {
  //const authError = await requireAdminSession(request);
  //if (authError) return authError;

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { data, error } = await supabase.from('coupons').select('*').eq('id', id).single();

  if (error || !data) {
    return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
  }

  // busca vínculos de produtos/categorias deste cupom específico
  const { data: productLinks } = await supabase
    .from('coupon_products')
    .select('product:products(id, name)')
    .eq('coupon_id', id);

  const { data: categoryLinks } = await supabase
    .from('coupon_categories')
    .select('category:categories(id, name)')
    .eq('coupon_id', id);

  const coupon = {
    ...data,
    products: (productLinks ?? []).map((l: any) => l.product).filter(Boolean),
    categories: (categoryLinks ?? []).map((l: any) => l.category).filter(Boolean),
  };

  return NextResponse.json({ coupon });
}


// Atualiza todos os campos do cupom
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  //const authError = await requireAdminSession(request);
  //if (authError) return authError;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { id } = await params;
  const body: CouponFormInput = await request.json();

  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 });
  }
  if (body.type !== 'free_shipping' && (!body.value || body.value <= 0)) {
    return NextResponse.json({ error: 'Valor de desconto inválido' }, { status: 400 });
  }

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
    .update({
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
    .eq('id', id)
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

  const { error: unlinkProductsError } = await supabase
    .from('coupon_products')
    .delete()
    .eq('coupon_id', id);

  const { error: unlinkCategoriesError } = await supabase
    .from('coupon_categories')
    .delete()
    .eq('coupon_id', id);

  if (unlinkProductsError || unlinkCategoriesError) {
    return NextResponse.json(
      {
        coupon: data,
        warning:
          'Cupom atualizado, mas falhou ao limpar vínculos antigos: ' +
          (unlinkProductsError?.message || unlinkCategoriesError?.message),
      },
      { status: 207 },
    );
  }

  if (scope === 'products' && body.product_ids?.length) {
    const { error: linkError } = await supabase
      .from('coupon_products')
      .insert(body.product_ids.map((product_id) => ({ coupon_id: id, product_id })));

    if (linkError) {
      return NextResponse.json(
        { coupon: data, warning: 'Cupom atualizado, mas falhou ao vincular produtos: ' + linkError.message },
        { status: 207 },
      );
    }
  }

  if (scope === 'categories' && body.category_ids?.length) {
    const { error: linkError } = await supabase
      .from('coupon_categories')
      .insert(body.category_ids.map((category_id) => ({ coupon_id: id, category_id })));

    if (linkError) {
      return NextResponse.json(
        { coupon: data, warning: 'Cupom atualizado, mas falhou ao vincular categorias: ' + linkError.message },
        { status: 207 },
      );
    }
  }

  return NextResponse.json({ coupon: data });
}

// Atualização parcial — usada pelo toggle de ativo/inativo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  //const authError = await requireAdminSession(request);
  //if (authError) return authError;

  const supabase = await createClient();const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from('coupons')
    .update({ active: body.active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  
  const supabase = await createClient();const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { id } = await params;

  const { error } = await supabase.from('coupons').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}