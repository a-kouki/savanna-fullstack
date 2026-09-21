// api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'
import { adminActionRateLimit } from '@/app/utils/redis';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitas chamadas em sequência. Aguarde um instante.' }, { status: 429 })
  }
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const limit = Number(searchParams.get('limit')) || undefined;
  const minimal = searchParams.get('minimal') === 'true';

  let query = supabase
    .from('products')
    .select(
      minimal
        ? 'id, name, images'
        : `id, name, src, price, description, images, in_stock, attributes,
           product_categories ( category:categories ( id, name, slug ) )`
    );

  if (search) query = query.ilike('name', `%${search}%`); 
  if (limit) query = query.limit(limit);

  const { data: products, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (minimal) return Response.json(products ?? []);

  //Que tipo de operação bigO é  o .map?
  //tem alternativa mellhor?
  const flattened = (products ?? []).map((p: any) => {
    const { product_categories, ...rest } = p;
    return { ...rest, category: product_categories?.[0]?.category ?? null };
  });

  return Response.json(flattened);
}