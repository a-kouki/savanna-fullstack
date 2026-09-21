//actions.ts é uma alternativa para /api

/*
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/utils/supabase/server'
//import { createAdminClient } from '@/lib/supabase/admin'; // ajuste o import conforme o client admin já usado no projeto
import type { Coupon, CouponFormInput } from '@/lib/types/coupon';

// -----------------------------------------------------------
// Listagem — inclui contagem de resgates de cada cupom
// -----------------------------------------------------------
export async function listCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!coupons?.length) return [];

  const { data: redemptions } = await supabase
    .from('coupon_redemptions')
    .select('coupon_id');

  const countByCoupon = new Map<string, number>();
  for (const r of redemptions ?? []) {
    countByCoupon.set(r.coupon_id, (countByCoupon.get(r.coupon_id) ?? 0) + 1);
  }

  return coupons.map((c) => ({
    ...c,
    total_redemptions: countByCoupon.get(c.id) ?? 0,
  }));
}

// -----------------------------------------------------------
// Buscar um cupom específico (tela de edição)
// -----------------------------------------------------------
export async function getCoupon(id: string): Promise<Coupon | null> {
  const supabase =  await createClient();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

// -----------------------------------------------------------
// Criar cupom
// -----------------------------------------------------------
export async function createCoupon(input: CouponFormInput) {
  const supabase = await createClient();

  const { error } = await supabase.from('coupons').insert({
    code: input.code.trim().toUpperCase(),
    description: input.description?.trim() || null,
    type: input.type,
    value: input.type === 'free_shipping' ? null : input.value,
    min_order_value: input.min_order_value ?? null,
    max_discount_value: input.max_discount_value ?? null,
    usage_limit_total: input.usage_limit_total ?? null,
    usage_limit_per_customer: input.usage_limit_per_customer ?? 1,
    starts_at: input.starts_at || null,
    expires_at: input.expires_at || null,
    active: input.active,
  });

  if (error) {
    // código duplicado é o erro mais comum aqui (unique constraint)
    if (error.code === '23505') {
      return { success: false, message: 'Já existe um cupom com esse código' };
    }
    return { success: false, message: error.message };
  }

  //obs: ver se falta 'max'
  revalidatePath('/admin/coupons');
  return { success: true };
}

// -----------------------------------------------------------
// Atualizar cupom
// -----------------------------------------------------------
export async function updateCoupon(id: string, input: CouponFormInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('coupons')
    .update({
      code: input.code.trim().toUpperCase(),
      description: input.description?.trim() || null,
      type: input.type,
      value: input.type === 'free_shipping' ? null : input.value,
      min_order_value: input.min_order_value ?? null,
      max_discount_value: input.max_discount_value ?? null,
      usage_limit_total: input.usage_limit_total ?? null,
      usage_limit_per_customer: input.usage_limit_per_customer ?? 1,
      starts_at: input.starts_at || null,
      expires_at: input.expires_at || null,
      active: input.active,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return { success: false, message: 'Já existe um cupom com esse código' };
    }
    return { success: false, message: error.message };
  }

  revalidatePath('/admin/coupons');
  return { success: true };
}

// -----------------------------------------------------------
// Ativar / desativar rapidamente (toggle na listagem)
// -----------------------------------------------------------
export async function toggleCouponActive(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from('coupons').update({ active }).eq('id', id);

  if (error) return { success: false, message: error.message };

  revalidatePath('/admin/coupons');
  return { success: true };
}

// -----------------------------------------------------------
// Deletar cupom
// Obs: coupon_redemptions tem ON DELETE CASCADE, então o
// histórico de resgates junto é apagado. Se quiser preservar
// auditoria, prefira "desativar" em vez de deletar.
// -----------------------------------------------------------
export async function deleteCoupon(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('coupons').delete().eq('id', id);

  if (error) return { success: false, message: error.message };

  revalidatePath('/admin/coupons');
  return { success: true };
}
*/