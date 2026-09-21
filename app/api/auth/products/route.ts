///api/auth/products/route.ts
import { createClient } from '@/app/utils/supabase/server'
import { revalidateTag } from 'next/cache'
import { resolveImages, cleanupRemovedImages, type IncomingImage, type ResolvedImage } from '@/app/lib/cloudinary-images'

const MAX_IMAGES = 6
const MAX_USAGE_GB = 2

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

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await req.formData()
  const data = formData.get('data') as string

  if (!data) return Response.json({ error: 'Dados inválidos' }, { status: 400 })

  const product = JSON.parse(data)
  const { id, src, attributes, category_id, images: incomingImages, ...fields } = product

  if (!product.name || !product.src) return Response.json({ error: 'Dados inválidos' }, { status: 400 })

  for (const [field, max] of Object.entries(limits.root)) {
    const value = product[field as keyof typeof limits.root]
    if (typeof value === 'string' && value.length > max) {
      return Response.json({ error: `${field} inválido` }, { status: 400 })
    }
  }

  for (const [field, max] of Object.entries(limits.attributes)) {
    const value = attributes?.[field]
    if (typeof value === 'string' && value.length > max) {
      return Response.json({ error: `${field} inválido` }, { status: 400 })
    }
  }

  const price = Number(product.price)
  if (!Number.isFinite(price)) {
    return Response.json({ error: 'Preço inválido' }, { status: 400 })
  }
  if (price < 0) {
    return Response.json({ error: 'Preço inválido' }, { status: 400 })
  }

  if (attributes?.tags !== undefined) {
    if (!Array.isArray(attributes.tags) || attributes.tags.length > limits.arrays.tags) {
      return Response.json({ error: 'tags inválido' }, { status: 400 })
    }
  }

  if (attributes?.sizes !== undefined && !Array.isArray(attributes.sizes)) {
    return Response.json({ error: 'sizes inválido' }, { status: 400 })
  }

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

  let images: ResolvedImage[]
  try {
    images = await resolveImages(incomingImages ?? [], formData)
  } catch (err: any) {
    return Response.json({ error: err.message ?? 'Erro ao processar imagens' }, { status: 413 })
  }

  const { data: inserted, error } = await supabase
    .from('products')
    .insert({
      user_id: process.env.USER_ID,
      name: product.name,
      src,
      price: product.price,
      description: product.description,
      images,
      in_stock: product.in_stock ?? true,
      attributes: attributes ?? {},
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  if (category_id) {
    const { error: linkError } = await supabase
      .from('product_categories')
      .insert({ product_id: inserted.id, category_id })

    if (linkError) {
      return Response.json(
        { ok: true, warning: 'Produto criado, mas falhou ao vincular categoria: ' + linkError.message },
        { status: 207 }
      )
    }
  }

  revalidateTag('products', 'max')
  return Response.json({ ok: true })
}


export async function PUT(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await req.formData()
  const data = formData.get('data') as string

  if (!data) return Response.json({ error: 'Dados inválidos' }, { status: 400 })

  const product = JSON.parse(data)
  const { id, src, attributes, category_id, images: incomingImages, ...fields } = product

  if (!id) return Response.json({ error: 'ID obrigatório para edição' }, { status: 400 })
  if (!product.name || !product.src) return Response.json({ error: 'Dados inválidos' }, { status: 400 })

  for (const [field, max] of Object.entries(limits.root)) {
    const value = product[field as keyof typeof limits.root]
    if (typeof value === 'string' && value.length > max) {
      return Response.json({ error: `${field} inválido` }, { status: 400 })
    }
  }

  for (const [field, max] of Object.entries(limits.attributes)) {
    const value = attributes?.[field]
    if (typeof value === 'string' && value.length > max) {
      return Response.json({ error: `${field} inválido` }, { status: 400 })
    }
  }

  const price = Number(product.price)
  if (!Number.isFinite(price)) {
    return Response.json({ error: 'Preço inválido' }, { status: 400 })
  }
  if (price < 0) {
    return Response.json({ error: 'Preço inválido' }, { status: 400 })
  }

  if (attributes?.tags !== undefined) {
    if (!Array.isArray(attributes.tags) || attributes.tags.length > limits.arrays.tags) {
      return Response.json({ error: 'tags inválido' }, { status: 400 })
    }
  }

  if (attributes?.sizes !== undefined && !Array.isArray(attributes.sizes)) {
    return Response.json({ error: 'sizes inválido' }, { status: 400 })
  }

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
      name: product.name,
      src,
      price: product.price,
      description: product.description,
      images,
      in_stock: product.in_stock ?? true,
      attributes: attributes ?? {},
    })
    .eq('id', id)

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