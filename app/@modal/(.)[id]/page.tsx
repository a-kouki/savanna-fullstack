// app/@modal/(.)products/[id]/page.tsx
import { Modal } from '@/app/ui/Modal'
import { ProductDetail } from '@/app/ui/Productdetail'
import { Suspense } from 'react'
import { LoadingSkeleton } from './loading'
import { Metadata } from 'next'
import { baseURL } from '@/services/api'
import { getProductsBySrc } from '@/app/lib/queries'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductsBySrc(id)

  if (!product) {
    return {
      title: 'Produto não encontrado — Savanna',
      alternates: { canonical: baseURL },
    }
  }

  return {
    title: `${product.name}${product.attributes?.brand ? ` — ${product.attributes.brand}` : ''} | Savanna`,
    description: product.description || product.name,
    keywords: [
      product.name,
      product.attributes?.brand,
      product.category_slug,
      'camiseta de futebol',
      'Savanna',
      'loja de camisetas',
    ].filter(Boolean) as string[],
    openGraph: {
      title: product.name,
      description: product.description || product.name,
      type: 'website',
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || product.name,
    },
    alternates: {
      canonical: `${baseURL}/products/${product.src}`,
    },
  }
}

export default async function Page({ params }: PageProps) {
  return (
    <Modal>
      <Suspense fallback={<LoadingSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </Modal>
  )
}