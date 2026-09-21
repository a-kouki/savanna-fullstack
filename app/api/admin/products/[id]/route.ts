// api/products/[id]/route.ts
import { NextResponse } from 'next/server'
import { adminActionRateLimit } from '@/app/utils/redis'
import { createClient } from '@/app/utils/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { success } = await adminActionRateLimit.limit(user!.id)
  if (!success) {
    return NextResponse.json({ error: 'Muitas chamadas em sequência. Aguarde um instante.' }, { status: 429 })
  }

  const { id } = await params
  const { data , error } = await supabase
    .from('products')
    .select(`
      id, name, src, price, description, images, in_stock, attributes,
      product_categories (
        category:categories ( id, name, slug )
      )
    `)
    .eq('src', id)  
  
  
  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Produto não encontrado' }, { status: 404 })

  const flattened = data.map((p: any) => {
    const { product_categories, ...rest } = p
    return {
      ...rest,
      category: product_categories?.[0]?.category ?? null,
    }
  })

  return Response.json(flattened)
}