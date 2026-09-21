// api/auth/products/[id]/route.ts
import { createClient } from '@/app/utils/supabase/server'
import { revalidateTag } from 'next/cache'
import { cloudinary, resolveImages, cleanupRemovedImages, type IncomingImage, type ResolvedImage } from '@/app/lib/cloudinary-images'

const limits = {
  root: {
    name: 60,
    src: 60,
    price: 20,
    description: 500,
  },
  attributes: { 
    brand: 40, 
    ratio: 10 }
  ,
  arrays: {
    tags: 20,
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const formData = await req.formData()
  const raw = formData.get('data') as string
  const file = formData.get('file') as File | null

  if (!raw) return Response.json({ error: 'Dados inválidos' }, { status: 400 })
  const products = JSON.parse(raw)
  if(!products.name || !products.src) return Response.json({ error: 'nome ou Slug Inválido' }, { status: 400 })

  const { src, attributes, category_id, images: incomingImages, ...fields } = products
  
  for (const [field, max] of Object.entries(limits.root)) {
    const value = products[field as keyof typeof limits.root]

    if (typeof value === 'string' && value.length > max) {
        return Response.json({ error: `${value} inválido` }, { status: 400 })
    }
  }

  for (const [field, max] of Object.entries(limits.attributes)) {
    const value = attributes?.[field]

    if (typeof value === 'string' && value.length > max) {
        return Response.json({ error: `Dados inválido` }, { status: 400 })
    }
  }

  const price = Number(products.price)
  if (!Number.isFinite(price)) {
    return Response.json({ error: 'Preço inválido' }, { status: 400 })
  }

  if (price < 0) {
    return Response.json({ error: 'Preço inválido' }, { status: 400 })
  }

  if (attributes?.tags !== undefined) {
    if (!Array.isArray(attributes.tags) || attributes.tags.length > limits.arrays.tags)
      return Response.json({ error: 'tags inválido' }, { status: 400 })
  }

  if (attributes?.sizes !== undefined && !Array.isArray(attributes.sizes))
    return Response.json({ error: 'sizes inválido' }, { status: 400 })

  if (category_id !== null && category_id !== undefined && category_id !== '') {
    const { data: categoryExists, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single()

    if (categoryError || !categoryExists) {
      return Response.json({ error: 'Categoria inválida' }, { status: 400 })
    }
  }
  const { data: existingProduct } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .single()

  const oldImages: ResolvedImage[] = existingProduct?.images ?? []

  let images: ResolvedImage[]
  try {
    images = await resolveImages(incomingImages ?? [], formData)
  } catch (err: any) {
    return Response.json({ error: err.message ?? 'Erro ao processar imagens' }, { status: 413 })
  }

  const { error } = await supabase
    .from('products')
    .update({
    user_id: process.env.USER_ID,
    name: products.name,
    price: products.price,
    description: products.description,
    images,

    in_stock: products.in_stock ?? true,
    src,
    attributes: attributes ?? {},
    })
    .eq('id', id)
    .eq('user_id', process.env.USER_ID)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  await cleanupRemovedImages(oldImages, images)

  const { error: unlinkError } = await supabase
    .from('product_categories')
    .delete()
    .eq('product_id', id)

  if (unlinkError) {
    return Response.json(
      { ok: true, warning: 'Produto atualizado, mas falhou ao limpar categoria antiga: ' + unlinkError.message },
      { status: 207 }
    )
  }

  if (category_id) {
    const { error: linkError } = await supabase
      .from('product_categories')
      .insert({ product_id: id, category_id })

    if (linkError) {
      return Response.json(
        { ok: true, warning: 'Produto atualizado, mas falhou ao vincular categoria: ' + linkError.message },
        { status: 207 }
      )
    }
  }
  
  revalidateTag('products', 'max')
  return Response.json({ ok: true })
}

// deleta produto pelo id numérico
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })
  
  const { id } = await params

  const { data: existing, error: fetchError } = await supabase
    .from('products')
    .select()
    .eq('id', id)
    .eq('user_id', process.env.USER_ID)
    .single()

  if (fetchError || !existing) {
    return Response.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  const images: ResolvedImage[] = existing.images ?? []
  await Promise.all(
    images
      .filter(img => img.public_id)
      .map(img => cloudinary.uploader.destroy(img.public_id as string).catch(() => {}))
  )

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('user_id', process.env.USER_ID)
  

  if (error) return Response.json({ error: error.message }, { status: 500 })

  revalidateTag('products', 'max')
  return Response.json({ ok: true })
}