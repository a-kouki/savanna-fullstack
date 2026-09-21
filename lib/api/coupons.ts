//  lib/api/coupons.ts
import type { Coupon, CouponFormInput } from '@/lib/types/coupon';

const BASE_URL = '/api/admin/coupons';

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Erro na requisição');
  }
  if (res.status === 207 && body.warning) {
    throw new Error(body.warning);
  }
  return body;
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const res = await fetch(BASE_URL, { cache: 'no-store' });
  const { coupons } = await handleResponse<{ coupons: Coupon[] }>(res);
  return coupons;
}

export async function fetchCoupon(id: string): Promise<Coupon> {
  const res = await fetch(`${BASE_URL}/${id}`, { cache: 'no-store' });
  const { coupon } = await handleResponse<{ coupon: Coupon }>(res);
  return coupon;
}

export async function createCoupon(input: CouponFormInput): Promise<Coupon> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const { coupon } = await handleResponse<{ coupon: Coupon }>(res);
  return coupon;
}

export async function updateCoupon(id: string, input: CouponFormInput): Promise<Coupon> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const { coupon } = await handleResponse<{ coupon: Coupon }>(res);
  return coupon;
}

export async function toggleCouponActive(id: string, active: boolean): Promise<Coupon> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  });
  const { coupon } = await handleResponse<{ coupon: Coupon }>(res);
  return coupon;
}

export async function deleteCoupon(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  await handleResponse(res);
}