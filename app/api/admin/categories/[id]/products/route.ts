//  /api/categories/[id]/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { revalidateTag } from 'next/cache';
import { adminActionRateLimit } from '@/app/utils/redis';

// Lista produtos vinculados a uma categoria
//Tipo de BigO
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  /*
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }*/

  const { data, error } = await supabase
    .from('product_categories')
    .select('product:products(*)')
    .eq('category_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = data.map((row) => row.product); //Qual Big O?

  return NextResponse.json({ products });
}

// Vincula um produto à categoria
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.product_id) {
    return NextResponse.json({ error: 'product_id é obrigatório' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  /*
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }*/

  const { error } = await supabase
    .from('product_categories')
    .insert({ category_id: id, product_id: body.product_id });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Produto já vinculado' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: category } = await supabase
    .from('categories')
    .select('slug')
    .eq('id', id)
    .single();

  if (category?.slug) {
    revalidateTag(`category-${category.slug}`, 'max');
  }
  revalidateTag('categories','max');

  return NextResponse.json({ success: true }, { status: 201 });
}

// Desvincula um produto da categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = request.nextUrl.searchParams.get('product_id'); 

  if (!productId) {
    return NextResponse.json({ error: 'product_id é obrigatório' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  /*
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }*/

  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('category_id', id)
    .eq('product_id', productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: category } = await supabase
    .from('categories')
    .select('slug')
    .eq('id', id)
    .single();

  if (category?.slug) {
     revalidateTag(`category-${category.slug}`, 'max');
  }
  revalidateTag('categories','max');

  return NextResponse.json({ success: true });
}