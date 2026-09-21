//  /api/categories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'
//import { requireAdminSession } from '@/lib/auth/require-admin-session';
import { slugify } from '@/lib/slugify';
import { revalidateTag } from 'next/cache';
import { adminActionRateLimit } from '@/app/utils/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  //const authError = await requireAdminSession(request);
  //if (authError) return authError;

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  /*
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }*/

  const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();

  if (error || !data) {
    return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ category: data });
}


// Atualiza nome (e regenera slug)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  // pega o slug ANTES de atualizar, pra poder invalidar o antigo também
  const { data: existing } = await supabase
    .from('categories')
    .select('slug')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: body.name.trim(),
      slug: slugify(body.name.trim()),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Já existe uma categoria com esse nome' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existing?.slug) {
    revalidateTag(`category-${existing.slug}`, 'max') 
    revalidateTag('categories', 'max')
  } 
  if (data?.slug) {
    revalidateTag(`category-${data.slug}`, 'max');
    revalidateTag('categories','max');
  }

  return NextResponse.json({ category: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  //const authError = await requireAdminSession(request);
  //if (authError) return authError;

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  /*
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitos uploads em sequência. Aguarde um instante.' }, { status: 429 })
  }*/

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}