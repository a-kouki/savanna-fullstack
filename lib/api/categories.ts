// lib/api/categories.ts

import type { Category, CategoryFormInput } from '@/lib/types/category';

const BASE_URL = '/api/admin/categories';

// /api/categories
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(BASE_URL);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Erro ao carregar categorias');
  }

  return data.categories;
}

// /api/categories/:id
export async function fetchCategory(id: string): Promise<Category> {
  const res = await fetch(`${BASE_URL}/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Erro ao carregar categoria');
  }

  return data.category;
}

// /api/categories
export async function createCategory(input: CategoryFormInput): Promise<Category> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Erro ao criar categoria');
  }

  return data.category;
}

// /api/categories/:id
export async function updateCategory(id: string, input: CategoryFormInput): Promise<Category> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Erro ao atualizar categoria');
  }

  return data.category;
}

// /api/categories/:id
export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Erro ao deletar categoria');
  }
}

// lib/api/categories.ts
export async function fetchCategoryProducts(categoryId: string) {
  const res = await fetch(`${BASE_URL}/${categoryId}/products`);
  if (!res.ok) throw new Error('Erro ao carregar produtos da categoria');
  const data = await res.json();
  return data.products;
}

export async function linkProductToCategory(categoryId: string, productId: number) {
  const res = await fetch(`${BASE_URL}/${categoryId}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Erro ao vincular produto');
  }
}

export async function unlinkProductFromCategory(categoryId: string, productId: number) {
  const res = await fetch(
    `${BASE_URL}/${categoryId}/products?product_id=${productId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Erro ao desvincular produto');
  }
}