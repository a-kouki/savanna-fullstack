//  /api/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'
import { slugify } from '@/lib/slugify';
import { revalidateTag } from 'next/cache';
import { adminActionRateLimit } from '@/app/utils/redis';

// Lista todas as categorias + contagem de produtos vinculados
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser()
  /*
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }*/

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!categories?.length) {
    return NextResponse.json({ categories: [] });
  }

  const { data: links } = await supabase
    .from('product_categories')
    .select('category_id, product:products(id, name, images)');

  const productsByCategory = new Map<string, { id: number; name: string; image_url: {url:string, public_id:string | null}[] }[]>();
  for (const l of links ?? []) {
    if (!l.product) continue;
    const list = productsByCategory.get(l.category_id) ?? [];
    list.push(l.product as any);
    productsByCategory.set(l.category_id, list);
  }

  const withProducts = categories.map((c) => {
    const products = productsByCategory.get(c.id) ?? [];
    return { ...c, total_products: products.length, products };
  });

  return NextResponse.json({ categories: withProducts });
}

// Cria uma nova categoria
export async function POST(request: NextRequest) {
  //const authError = await requireAdminSession(request);
  //if (authError) return authError;

  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  /*
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }*/

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: body.name.trim(),
      slug: slugify(body.name.trim()),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já existe uma categoria com esse nome' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag('categories', 'max'); 
  
  return NextResponse.json({ category: data }, { status: 201 });
}