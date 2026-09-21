//lib/api/banners.ts
import type { Banner } from '@/lib/types/banners';

const BASE_URL = '/api/admin/banners';

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Erro na requisição');
  }
  return body;
}

export async function fetchBanners(): Promise<Banner[]> {
  const res = await fetch(BASE_URL, { cache: 'no-store' });
  const { banners } = await handleResponse<{ banners: Banner[] }>(res);
  return banners;
}

export async function fetchBanner(id: string): Promise<Banner> {
  const res = await fetch(`${BASE_URL}/${id}`, { cache: 'no-store' });
  const { banner } = await handleResponse<{ banner: Banner }>(res);
  return banner;
}

export async function createBanner(formData: FormData): Promise<Banner> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    body: formData, 
  });
  const { banner } = await handleResponse<{ banner: Banner }>(res);
  return banner;
}

export async function updateBanner(id: string, formData: FormData): Promise<Banner> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: formData,
  });
  const { banner } = await handleResponse<{ banner: Banner }>(res);
  return banner;
}

export async function toggleBannerActive(id: string, active: boolean): Promise<Banner> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active }),
  });
  const { banner } = await handleResponse<{ banner: Banner }>(res);
  return banner;
}

export async function reorderBanner(id: string, sort_order: number): Promise<Banner> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sort_order }),
  });
  const { banner } = await handleResponse<{ banner: Banner }>(res);
  return banner;
}

export async function deleteBanner(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  await handleResponse(res);
}
