//app/[id]/page.tsx
import { ProductGallery } from "./_components/Productgallery "
import { ProductInfo } from "./_components/Productinfo"
import { RelatedCarousel } from "./_components/Relatedcarousel"
import { Contact } from "@/app/_components/Contact"
import {Nav} from "./_components/Nav"
import { getProductsBySrc } from "@/app/lib/queries"
import { notFound } from "next/navigation"

{/*
// ─── Geração estática das rotas ──────────────────────────────────────────────
export async function generateStaticParams() {
  const products = await getProducts()
  return Object.keys(products).map((src) => ({ id: src }))
}

// ─── Metadata dinâmica ────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProductsBySrc(params.id)
  if (!product) return {}
  return {
    title: `${product.name} | Savanna`,
    description: product.description,
    openGraph: {
      images: [product.image_url],
    },
  }
}
  */}

export default async function ProductPage({ params }:{ params: Promise<{ src: string }> }) {
  const { src } = await params
  const product = await getProductsBySrc(src)
  if (!product) notFound()


  return (
    <div className="bg-white min-h-screen">
      <Nav />
      <main className="flex justify-center pt-20">
        <div className="w-full max-w-widthGlobal px-4 md:px-pxGloabl py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-start">
            <ProductGallery images={product.images} name={product.name} />
            <ProductInfo product={product} />
          </div>
          <RelatedCarousel
            categorySlug={product.category_slug}
            currentSrc={product.src}
          />
        </div>
      </main>
      <Contact />
    </div>
  )
}