// /api/coupons/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { calculateDiscount } from '@/lib/coupons/calculateDiscount';
import { gatekeeper } from '@/app/lib/security/gatekeeper';
import { validateRateLimit } from '@/app/utils/redis';

type ValidatePayload = {
  code: string;
  phone: string;
  email?: string | null;
  items: { product_id: number; quantity: number; unit_price: number }[];
  honeypot?: string | null
};

export async function POST(request: NextRequest) {
  let body: ValidatePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const { code, phone, email, items, honeypot } = body;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
  const blocked = await gatekeeper({ ip, honeypot, limiter: validateRateLimit })
  if (blocked) return blocked

  // toda a lógica de busca/validação/cálculo 
  const result = await calculateDiscount(code, phone, email, items);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    valid: true,
    coupon_id: result.coupon_id,
    code: result.code,
    type: result.type,
    scope: result.scope,
    discount_amount: result.discount_amount,
    free_shipping: result.free_shipping,
    eligible_product_ids: result.eligible_product_ids,
    cart_subtotal: result.cart_subtotal,
    eligible_subtotal: result.eligible_subtotal,
    total: result.cart_subtotal - result.discount_amount,
  });
}